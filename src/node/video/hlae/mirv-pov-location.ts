import path from 'node:path';
import { getAppFolderPath } from 'csdm/node/filesystem/get-app-folder-path';

export const MIRV_POV_HOOK_DLL_FILE_NAME = 'AfxHookSource2.dll';
export const MIRV_POV_INSTALLED_HOOK_DLL_FILE_NAME = 'AfxHookSource2.mirv-pov.dll';
export const MIRV_POV_VERSION_FILE_NAME = 'version.txt';

export function getMirvPovFolderPath() {
  return path.join(getAppFolderPath(), 'hlae-mirv-pov');
}

export function getMirvPovHookDllPath() {
  return path.join(getMirvPovFolderPath(), MIRV_POV_HOOK_DLL_FILE_NAME);
}

export function getMirvPovVersionFilePath() {
  return path.join(getMirvPovFolderPath(), MIRV_POV_VERSION_FILE_NAME);
}

/** Hook DLL path next to HLAE's x64 dependencies (AfxHook.dat, VC runtimes). */
export function getMirvPovInstalledHookDllPath(hlaeExecutablePath: string) {
  return path.join(path.dirname(hlaeExecutablePath), 'x64', MIRV_POV_INSTALLED_HOOK_DLL_FILE_NAME);
}
