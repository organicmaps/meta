import { describe, expect, test } from '@jest/globals';
import { getLatestRelease } from '../src/releases';

describe('Get app release version for flavor', () => {
  const flavors = ['2022.08.23-1-web'];
  for (let flavor of flavors) {
    test(flavor, async () => {
      let req = new Request('http://127.0.0.1:8787/releases', {
        headers: {
          'X-OM-AppVersion': flavor.toLowerCase(),
        },
      });
      const response = await getLatestRelease(req);
      // TODO: How to print response.text in case of error?
      expect(response.status).toBe(200);
      const result = JSON.parse(await response.text());
      expect(Number.parseInt(result.code)).toBeGreaterThanOrEqual(23040200);
      expect(result.apk).toBeDefined();
    });
  }
});

describe('Unsupported flavors for app update checks', () => {
  const unsupported = [
    'garbage',
    '',
    '20220823',
    '2022.08',
    '2022.08.23', // Older iOS clients
    '2022.08.23-1-Google-beta',
    '2022.08.23-5-Google-debug',
    '2022.08.23-1-fdroid-beta',
    '2022.08.23-1-fdroid-debug',
    '2022.08.23-1-web-beta',
    '2022.08.23-1-web-debug',
    '2022.08.23-1-Huawei-beta',
    '2022.08.23-1-Huawei-debug',
    // Mac OS version is not published yet anywhere.
    '2023.04.28-9-592bca9a-dirty-Darwin',
    '2023.04.28-9-592bca9a-Darwin',
  ];
  for (let flavor of unsupported) {
    test(flavor, async () => {
      let req = new Request('http://127.0.0.1:8787/releases', {
        headers: {
          'X-OM-AppVersion': flavor.toLowerCase(),
        },
      });
      try {
        const response = await getLatestRelease(req);
        expect(response.status).toBeGreaterThanOrEqual(400);
      } catch (err) {
        expect(err).toContain('Unsupported app version');
      }
    });
  }
});
