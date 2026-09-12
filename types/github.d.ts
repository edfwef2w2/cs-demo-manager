interface GitHubAssetResponse {
  name: string;
  browser_download_url: string;
  digest?: string;
}

interface GitHubReleaseResponse {
  assets: GitHubAssetResponse[];
  tag_name: string;
  prerelease: boolean;
}
