import { Game } from 'csdm/common/types/counter-strike';

export function getLargePlayerCountCommand(game: Game, enabled: boolean) {
  const value = enabled ? 1 : 0;
  if (game === Game.CSGO) {
    return `cl_hud_playercount_showcount ${value}`;
  }

  return `cl_teamcounter_playercount_instead_of_avatars ${value}`;
}
