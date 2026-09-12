import { describe, expect, it } from 'vite-plus/test';
import {
  sanitizeOfflineLaunchParameterString,
  sanitizeOfflineLaunchParameters,
} from './sanitize-offline-launch-parameters';

describe('sanitizeOfflineLaunchParameters', () => {
  it('removes +connect and its host argument', () => {
    expect(sanitizeOfflineLaunchParameters(['-insecure', '+connect', '1.2.3.4:27015', '-novid'])).toEqual([
      '-insecure',
      '-novid',
    ]);
  });

  it('removes connect variants from a combined string argument', () => {
    expect(sanitizeOfflineLaunchParameterString('-novid +connect 10.0.0.1:27015 -sw')).toEqual('-novid -sw');
  });

  it('keeps playdemo paths', () => {
    expect(sanitizeOfflineLaunchParameters(['+playdemo', '\\"C:/demos/a.dem\\"', '-insecure'])).toEqual([
      '+playdemo',
      '\\"C:/demos/a.dem\\"',
      '-insecure',
    ]);
  });

  it('removes reconnect and retry', () => {
    expect(sanitizeOfflineLaunchParameters(['+reconnect', '+retry', '-console'])).toEqual(['-console']);
  });
});
