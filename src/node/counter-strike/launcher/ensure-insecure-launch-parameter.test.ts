import { describe, expect, it } from 'vite-plus/test';
import { ensureInsecureLaunchParameter } from './ensure-insecure-launch-parameter';

describe('ensureInsecureLaunchParameter', () => {
  it('keeps an existing -insecure flag', () => {
    expect(ensureInsecureLaunchParameter(['-insecure', '-novid'])).toEqual(['-insecure', '-novid']);
  });

  it('detects -insecure inside a combined argument', () => {
    expect(ensureInsecureLaunchParameter(['-novid -insecure -console'])).toEqual(['-novid -insecure -console']);
  });

  it('prepends -insecure when missing', () => {
    expect(ensureInsecureLaunchParameter(['-novid', '-sw'])).toEqual(['-insecure', '-novid', '-sw']);
  });
});
