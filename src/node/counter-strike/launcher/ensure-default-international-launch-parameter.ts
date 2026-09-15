const DEFAULT_INTERNATIONAL_LAUNCH_PARAMETER = '-worldwide';

/**
 * CSDM-only: when launching CS via CSDM and the user left Playback → Launch
 * parameters empty, inject -worldwide into THIS process command line.
 * Does not write Steam launch options or affect games started outside CSDM.
 * If the user set any launch parameters, leave them unchanged.
 */
export function ensureDefaultInternationalLaunchParameter(userLaunchParameters: string | undefined | null): string {
  if (typeof userLaunchParameters === 'string' && userLaunchParameters.trim() !== '') {
    return userLaunchParameters;
  }
  return DEFAULT_INTERNATIONAL_LAUNCH_PARAMETER;
}
