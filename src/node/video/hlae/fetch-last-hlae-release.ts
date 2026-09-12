function isHlaeZipAsset(assetName: string) {
  return /^hlae_.+\.zip$/i.test(assetName);
}

export async function fetchLastHlaeRelease() {
  const response = await fetch('https://api.github.com/repos/advancedfx/advancedfx/releases', {
    headers: {
      'User-Agent': 'CS:DM',
    },
  });
  const releases: GitHubReleaseResponse[] = await response.json();
  for (const release of releases) {
    const zipAsset = release.assets.find((asset) => isHlaeZipAsset(asset.name));
    if (zipAsset === undefined) {
      continue;
    }

    // downloadHlae uses assets[0]; keep the zip first even for prereleases that also ship .asc / setup.
    return {
      ...release,
      assets: [zipAsset, ...release.assets.filter((asset) => asset.name !== zipAsset.name)],
    };
  }

  throw new Error('No HLAE releases found');
}
