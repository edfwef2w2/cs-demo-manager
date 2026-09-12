import { describe, expect, it } from 'vite-plus/test';
import { findMirvPovHookAsset, pickMirvPovHookRelease } from './ensure-mirv-pov-hook-dll';

function release(tag: string, assetNames: string[], prerelease = false): GitHubReleaseResponse {
  return {
    tag_name: tag,
    prerelease,
    assets: assetNames.map((name) => ({
      name,
      browser_download_url: `https://example.com/${name}`,
      digest: undefined,
    })),
  } as GitHubReleaseResponse;
}

describe('pickMirvPovHookRelease', () => {
  it('prefers the newest release including prerelease zips', () => {
    const selected = pickMirvPovHookRelease([
      release('prerelease-66-abc', ['AfxHookSource2-abc-windows-x64.zip', 'AfxHookSource2-abc-source.zip'], true),
      release('mirv-pov-20260825', ['AfxHookSource2.dll'], false),
    ]);

    expect(selected.release.tag_name).toBe('prerelease-66-abc');
    expect(selected.kind).toBe('zip');
  });

  it('falls back to a bare DLL asset', () => {
    const selected = pickMirvPovHookRelease([release('mirv-pov-20260825', ['AfxHookSource2.dll'])]);
    expect(selected.kind).toBe('dll');
    expect(selected.asset.name).toBe('AfxHookSource2.dll');
  });

  it('ignores source-only zips', () => {
    expect(findMirvPovHookAsset(release('x', ['AfxHookSource2-abc-source.zip'], true))).toBeUndefined();
  });
});
