import path from 'node:path';
import fs from 'fs-extra';
import { describe, expect, it } from 'vite-plus/test';
import {
  getOfflineRecordingCfgContent,
  OFFLINE_RECORDING_CFG_NAME,
  writeOfflineRecordingCfg,
} from './write-offline-recording-cfg';

describe('writeOfflineRecordingCfg', () => {
  it('writes lockdown aliases into csdm_offline.cfg', async () => {
    const folder = path.join('/tmp', `csdm-offline-cfg-${Date.now()}`);
    const filePath = await writeOfflineRecordingCfg(folder);
    expect(filePath).toBe(path.join(folder, OFFLINE_RECORDING_CFG_NAME));
    const content = await fs.readFile(filePath, 'utf8');
    expect(content).toBe(getOfflineRecordingCfgContent());
    expect(content).toContain('alias connect');
    await fs.remove(folder);
  });
});
