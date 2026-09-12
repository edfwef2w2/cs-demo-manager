import { describe, expect, it } from 'vite-plus/test';
import { getMirvPovInstalledHookDllPath, MIRV_POV_INSTALLED_HOOK_DLL_FILE_NAME } from './mirv-pov-location';

describe('mirv-pov-location', () => {
  it('installs the injectable hook next to HLAE x64 dependencies', () => {
    expect(getMirvPovInstalledHookDllPath('C:/hlae/hlae.exe').replaceAll('\\', '/')).toBe(
      `C:/hlae/x64/${MIRV_POV_INSTALLED_HOOK_DLL_FILE_NAME}`,
    );
    expect(MIRV_POV_INSTALLED_HOOK_DLL_FILE_NAME).toBe('AfxHookSource2.mirv-pov.dll');
  });
});
