import { createHash } from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { downloadAndExtractZipArchive } from 'csdm/node/filesystem/download-and-extract-zip-archive';
import { downloadFile } from 'csdm/node/filesystem/download-file';
import {
  getMirvPovHookDllPath,
  getMirvPovInstalledHookDllPath,
  getMirvPovVersionFilePath,
  MIRV_POV_HOOK_DLL_FILE_NAME,
} from './mirv-pov-location';

type MirvPovHookAssetKind = 'dll' | 'zip';

export type MirvPovHookReleaseSelection = {
  release: GitHubReleaseResponse;
  asset: GitHubAssetResponse;
  kind: MirvPovHookAssetKind;
};

function isWindowsX64ZipAsset(assetName: string) {
  return /^AfxHookSource2-.*-windows-x64\.zip$/i.test(assetName);
}

export function findMirvPovHookAsset(
  release: GitHubReleaseResponse,
): Omit<MirvPovHookReleaseSelection, 'release'> | undefined {
  const zipAsset = release.assets.find((asset) => isWindowsX64ZipAsset(asset.name));
  if (zipAsset !== undefined) {
    return { asset: zipAsset, kind: 'zip' };
  }

  const dllAsset = release.assets.find((asset) => asset.name === MIRV_POV_HOOK_DLL_FILE_NAME);
  if (dllAsset !== undefined) {
    return { asset: dllAsset, kind: 'dll' };
  }

  return undefined;
}

/**
 * Picks the newest WangChuDi/advancedfx release that ships AfxHookSource2 for mirv_pov.
 * Newer builds are published as GitHub prereleases (zip); older tags ship a bare DLL.
 */
export function pickMirvPovHookRelease(releases: GitHubReleaseResponse[]): MirvPovHookReleaseSelection {
  for (const release of releases) {
    const match = findMirvPovHookAsset(release);
    if (match !== undefined) {
      return { release, ...match };
    }
  }

  throw new Error('No mirv_pov AfxHookSource2.dll release found');
}

async function fetchMirvPovReleases() {
  const response = await fetch('https://api.github.com/repos/WangChuDi/advancedfx/releases', {
    headers: {
      'User-Agent': 'CS:DM',
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to list mirv_pov releases (status ${response.status})`);
  }

  return (await response.json()) as GitHubReleaseResponse[];
}

function getSha256FromDigest(digest: string | undefined) {
  if (digest === undefined) {
    return undefined;
  }

  const prefix = 'sha256:';
  if (!digest.startsWith(prefix)) {
    return undefined;
  }

  return digest.slice(prefix.length).toLowerCase();
}

async function assertSha256OrNonEmpty(filePath: string, expectedSha256: string | undefined) {
  if (expectedSha256 !== undefined) {
    const fileBuffer = await fs.readFile(filePath);
    const actualSha256 = createHash('sha256').update(fileBuffer).digest('hex');
    if (actualSha256 !== expectedSha256) {
      await fs.remove(filePath);
      throw new Error('mirv_pov hook DLL checksum mismatch');
    }
    return;
  }

  const stats = await fs.stat(filePath);
  if (stats.size === 0) {
    await fs.remove(filePath);
    throw new Error('Downloaded mirv_pov hook DLL is empty');
  }
}

async function downloadMirvPovHookDll(selection: MirvPovHookReleaseSelection, downloadPath: string) {
  if (selection.kind === 'dll') {
    await downloadFile(selection.asset.browser_download_url, downloadPath);
    await assertSha256OrNonEmpty(downloadPath, getSha256FromDigest(selection.asset.digest));
    return;
  }

  const extractDir = path.join(os.tmpdir(), `csdm-mirv-pov-${selection.release.tag_name}`);
  await fs.remove(extractDir);
  try {
    await downloadAndExtractZipArchive(selection.asset.browser_download_url, extractDir);
    const extractedDllPath = path.join(extractDir, MIRV_POV_HOOK_DLL_FILE_NAME);
    if (!(await fs.pathExists(extractedDllPath))) {
      throw new Error(`mirv_pov zip is missing ${MIRV_POV_HOOK_DLL_FILE_NAME}`);
    }
    await fs.move(extractedDllPath, downloadPath, { overwrite: true });
    await assertSha256OrNonEmpty(downloadPath, undefined);
  } finally {
    await fs.remove(extractDir);
  }
}

export async function ensureMirvPovHookDll(hlaeExecutablePath: string) {
  const selection = pickMirvPovHookRelease(await fetchMirvPovReleases());
  const dllPath = getMirvPovHookDllPath();
  const versionFilePath = getMirvPovVersionFilePath();
  const installedDllPath = getMirvPovInstalledHookDllPath(hlaeExecutablePath);
  const dllExists = await fs.pathExists(dllPath);
  const versionFileExists = await fs.pathExists(versionFilePath);
  const localVersion = dllExists && versionFileExists ? (await fs.readFile(versionFilePath, 'utf8')).trim() : '';

  if (!(dllExists && localVersion === selection.release.tag_name)) {
    const downloadPath = `${dllPath}.download`;
    await fs.remove(downloadPath);
    await downloadMirvPovHookDll(selection, downloadPath);
    await fs.move(downloadPath, dllPath, { overwrite: true });
    await fs.writeFile(versionFilePath, selection.release.tag_name);
  }

  // Inject from HLAE's x64 folder so AfxHook.dat / VC runtimes resolve like the official hook.
  await fs.ensureDir(path.dirname(installedDllPath));
  await fs.copy(dllPath, installedDllPath, { overwrite: true });

  return installedDllPath;
}
