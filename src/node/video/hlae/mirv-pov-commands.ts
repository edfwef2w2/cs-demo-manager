export const MIRV_POV_ENABLE_COMMAND = 'mirv_pov 1';

export const MIRV_POV_OFFLINE_LOCKDOWN_COMMANDS = [
  'alias connect "echo [CS:DM] Online play is disabled during MIRV POV recording"',
  'alias connect_lobby "echo [CS:DM] Online play is disabled during MIRV POV recording"',
  'alias reconnect "echo [CS:DM] Online play is disabled during MIRV POV recording"',
  'alias retry "echo [CS:DM] Online play is disabled during MIRV POV recording"',
] as const;

export function getCs2DeathNoticesDrawCommand(showOnlyDeathNotices: boolean, mirvPov: boolean) {
  const hideHudExceptDeathNotices = showOnlyDeathNotices && !mirvPov;

  return `cl_draw_only_deathnotices ${hideHudExceptDeathNotices ? 1 : 0}`;
}

export function shouldEnableMirvPov(mirvPov: boolean, isHlaeRecording: boolean) {
  return mirvPov && isHlaeRecording;
}
