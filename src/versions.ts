export {};

export function parseDataVersion(strDataVersion: string | null): number | null {
  if (!strDataVersion) {
    return null;
  }

  const dataVersion = parseInt(strDataVersion);
  if (Number.isNaN(dataVersion) || dataVersion < 210000 || dataVersion > 500000) {
    return null;
  }

  return dataVersion;
}

interface AppVersion {
  code: number;
  build?: number;
  flavor?: string;
  type?: string; // 'debug' | 'beta'
}

const APK_NAME_RE = /^OrganicMaps-(?<code>2\d{7})-(?<flavor>[A-Za-z3264]+)-(?<type>beta|debug|release)\.apk$/;

export function parseApkName(apkName: string): AppVersion | null {
  const m = apkName.match(APK_NAME_RE);
  if (m === null || !m.groups) return null;
  const code = parseInt(m.groups.code);
  if (Number.isNaN(code) || code < 20000000 || code > 30000000) return null;
  const flavor = m.groups.flavor;
  const type = m.groups.type;
  const apkVersion: AppVersion = {
    code: code,
    flavor: flavor,
    type: type,
  };
  return apkVersion;
}

// 2022.11.20 for iOS versions released before November 21 (without donate menu)
// 2022.11.24-4-ios for newer iOS versions (with donate menu)
// 2022.12.24-10-Google for Android
// 2022.12.24-10-Google-beta for Android
// 2022.12.24-3-3f4ca43-Linux or 2022.12.24-3-3f4ca43-dirty-Linux for Linux
// 2022.12.24-3-3f4ca43-Darwin for Mac
const VERSION_RE =
  /(?<year>\d{4})\.(?<month>\d{1,2})\.(?<day>\d{1,2})(?:$|-(?<build>[0-9]+)(?:-[0-9a-f]+)?(?:-dirty)?-(?<flavor>[A-Za-z3264]+))(?:-(?<type>beta|debug))?/;
// Returns code like 221224 for both platforms, build and flavor for Android and newer iOS versions.
export function parseAppVersion(versionName: string | null): AppVersion | null {
  if (!versionName) {
    return null;
  }

  const m = versionName.match(VERSION_RE);
  if (m === null || m.length < 4 || !m.groups) {
    return null;
  }
  const yyyy = parseInt(m.groups.year);
  if (Number.isNaN(yyyy) || yyyy > 2099 || yyyy < 2022) {
    return null;
  }
  const mm = parseInt(m.groups.month);
  if (Number.isNaN(mm) || mm > 12 || mm < 1) {
    return null;
  }
  const dd = parseInt(m.groups.day);
  if (Number.isNaN(dd) || dd > 31 || dd < 1) {
    return null;
  }

  const code = parseInt(String(yyyy % 100) + String(mm).padStart(2, '0') + String(dd).padStart(2, '0'));
  // Older iOS versions without donate button.
  if (!m.groups.build) {
    return { code: code };
  }

  // 'ios' for iOS devices.
  const flavor = (m.groups.flavor !== undefined && m.groups.flavor.toLowerCase()) || undefined;

  const appVersion: AppVersion = {
    code: code,
    flavor: flavor,
  };

  const buildNumber = parseInt(m.groups.build);
  if (!Number.isNaN(buildNumber)) appVersion.build = buildNumber;

  if (m.groups.type !== undefined) appVersion.type = m.groups.type;

  return appVersion;
}
