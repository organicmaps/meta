import { describe, expect, test } from '@jest/globals';
import { parseDataVersion, parseAppVersion } from '../src/versions';

describe('parseDataVersion', () => {
  const tests: { [key: string]: number | null } = {
    '220801': 220801,
    '210000': 210000,
    '500000': 500000,
    '200000': null,
    '500001': null,
    garbage: null,
    null: null,
    '': null,
  };
  for (const input in tests) {
    test(input, () => expect(parseDataVersion(input)).toEqual(tests[input]));
  }
  test('', () => expect(parseDataVersion(null)).toEqual(null));
});

describe('parseAppVersion', () => {
  const tests: { [key: string]: object | null } = {
    // Older iOS releases without donate menu
    '2022.08.01': { code: 220801 },
    // Newer iOS releases with donate menu
    '2022.11.25-5-ios': { code: 221125, build: 5, flavor: 'ios' },
    // There were no such versions in production.
    '2022.08.01-1': null,
    '2022.08.01-1-Google': { code: 220801, build: 1, flavor: 'google' },
    // -debug is ignored
    '2022.08.01-1-Google-debug': { code: 220801, build: 1, flavor: 'google' },
    // TODO: Fix regexp. Not it should not happen in production.
    //'2022.08.01-1-fd-debug': { code: 220801, build: 1, flavor: 'fd' },
    '2022.1.1-0': null,
    '2099.12.31-999999999': null,
    '2023.03.22-1-4fac32de-Linux': { code: 230322, build: 1, flavor: 'linux' },
    '2023.03.22-1-4fac32de-dirty-Linux': { code: 230322, build: 1, flavor: 'linux' },
    '2023.03.22-1-4fac32de-Darwin': { code: 230322, build: 1, flavor: 'darwin' },
    '2023.03.22-1-4fac32de-dirty-Darwin': { code: 230322, build: 1, flavor: 'darwin' },
    '2021.01.31-1': null,
    '2100.01.31-1': null,
    '2022.00.31-1': null,
    '2022.13.31-1': null,
    '2022.01.00-1': null,
    '2022.01.32-1': null,
    '22.01.31-1': null,
    '22.01.31': null,
    '22.01.31-3-flavor': null,
    '202.01.31-1': null,
    '202.01.312-1': null,
    '202.01.312': null,
    '202.01.31-aa-flavor': null,
    '202.01.31-5a-flavor': null,
    '202.01.31-a5-flavor': null,
    '2022..31-11': null,
    '2022..31-11-flavor': null,
    '.11.31-11': null,
    '.11.31-11-flavor': null,
    '.11..31-11-flavor': null,
    garbage: null,
    '': null,
    null: null,
  };
  for (const input in tests) {
    test(input, () => expect(parseAppVersion(input)).toEqual(tests[input]));
  }
  test('', () => expect(parseAppVersion(null)).toEqual(null));
});
