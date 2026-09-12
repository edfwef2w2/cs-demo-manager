import { describe, expect, it } from 'vite-plus/test';
import {
  MIRV_POV_ENABLE_COMMAND,
  MIRV_POV_OFFLINE_LOCKDOWN_COMMANDS,
  getCs2DeathNoticesDrawCommand,
  shouldEnableMirvPov,
} from './mirv-pov-commands';

describe('mirv-pov-commands', () => {
  it('enables mirv only for HLAE recording', () => {
    expect(shouldEnableMirvPov(true, true)).toBe(true);
    expect(shouldEnableMirvPov(true, false)).toBe(false);
    expect(shouldEnableMirvPov(false, true)).toBe(false);
  });

  it('keeps death notices visible when mirv pov is on', () => {
    expect(getCs2DeathNoticesDrawCommand(true, true)).toBe('cl_draw_only_deathnotices 0');
    expect(getCs2DeathNoticesDrawCommand(true, false)).toBe('cl_draw_only_deathnotices 1');
  });

  it('exposes offline lockdown aliases', () => {
    expect(MIRV_POV_ENABLE_COMMAND).toBe('mirv_pov 1');
    expect(MIRV_POV_OFFLINE_LOCKDOWN_COMMANDS.length).toBeGreaterThan(0);
    expect(MIRV_POV_OFFLINE_LOCKDOWN_COMMANDS.every((cmd) => cmd.includes('alias'))).toBe(true);
  });
});
