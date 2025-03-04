import { parseAppVersion, parseApkName } from './versions';

const GITHUB_RELEASES_URL: string = 'https://api.github.com/repos/organicmaps/organicmaps/releases';
// https://docs.github.com/en/rest/authentication/authenticating-to-the-rest-api?apiVersion=2022-11-28#authenticating-with-a-personal-access-token
const GITHUB_BEARER_TOKEN: string =
  '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';

interface AppReleaseMetadata {
  published_at: Date;
  code: number;
  flavor?: string;
  type?: string;
  apk: {
    url: string;
    name: string;
    size: number;
  };
  // TODO: figure out how to define map properly.
  news: {
    'en-US': string;
  };
}

interface GitHubReleaseAssetMetadata {
  browser_download_url: string;
  name: string;
  size: number;
  content_type: string;
  state: string;
}

interface GitHubReleaseMetadata {
  published_at: Date;
  draft: boolean;
  prerelease: boolean;
  body: string;
  assets: [GitHubReleaseAssetMetadata];
}

export async function getLatestRelease(request: Request) {
  const appVersion = parseAppVersion(request.headers.get('x-om-appversion'));
  if (!appVersion) return new Response('Unknown app version', { status: 400 });

  // The release version doesn't have `-release` suffix, thus type should be `undefined`.
  if (appVersion.flavor != 'web' || appVersion.type !== undefined)
    return new Response('Unknown app version', { status: 400 });

  const response = await fetch(GITHUB_RELEASES_URL, {
    cf: {
      // Always cache this fetch (including 404 responses) regardless of content type
      // for a max of 30 minutes before revalidating the resource
      cacheTtl: 30 * 60,
      cacheEverything: true,
    },
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'curl/8.4.0', // GitHub returns 403 without this.
      'X-GitHub-Api-Version': '2022-11-28',
      Authorization: `Bearer ${GITHUB_BEARER_TOKEN}`,
    },
  });
  if (response.status != 200)
    return new Response(`Bad response status ${response.status} ${response.statusText} ${response.body} from GitHub`, {
      status: 500,
    });

  const releases = (await response.json()) as [GitHubReleaseMetadata];
  const release = releases.find((release) => release.draft == false && release.prerelease == false);
  if (release == undefined) return new Response('No published release in GitHub response', { status: 500 });

  const apk = release.assets.find(
    (asset) => asset.content_type == 'application/vnd.android.package-archive' && asset.name.endsWith('.apk'),
  );
  if (!apk) throw new Error('The latest release does not have APK asset');
  const apkVersion = parseApkName(apk.name);
  if (!apkVersion) throw new Error(`Failed to parse APK name: ${apk}`);
  if (apkVersion.flavor != 'web' || apkVersion.type != 'release') throw new Error(`Unsupported APK name: ${apk}`);

  const result: AppReleaseMetadata = {
    published_at: release.published_at,
    code: apkVersion.code,
    news: {
      'en-US': release.body,
    },
    apk: {
      name: apk.name,
      size: apk.size,
      url: apk.browser_download_url,
    },
  };

  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' },
  });
}
