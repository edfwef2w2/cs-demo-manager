import { describe, expect, it } from 'vite-plus/test';
import { Game } from 'csdm/common/types/counter-strike';
import { getLargePlayerCountCommand } from './get-large-player-count-command';

describe('getLargePlayerCountCommand', () => {
  it('uses the CS2 team counter cvar', () => {
    expect(getLargePlayerCountCommand(Game.CS2, true)).toBe('cl_teamcounter_playercount_instead_of_avatars 1');
    expect(getLargePlayerCountCommand(Game.CS2, false)).toBe('cl_teamcounter_playercount_instead_of_avatars 0');
  });

  it('uses the CS:GO HUD player count cvar', () => {
    expect(getLargePlayerCountCommand(Game.CSGO, true)).toBe('cl_hud_playercount_showcount 1');
  });
});
