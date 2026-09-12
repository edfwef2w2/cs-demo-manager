const BLOCKED_LAUNCH_COMMANDS = new Set([
  'connect',
  '+connect',
  'connect_lobby',
  '+connect_lobby',
  'reconnect',
  '+reconnect',
  'retry',
  '+retry',
  'matchmakingserver',
  '+matchmakingserver',
]);

function isBlockedCommandToken(token: string) {
  return BLOCKED_LAUNCH_COMMANDS.has(token.toLowerCase());
}

function looksLikeCommandArgument(token: string) {
  return token !== '' && !token.startsWith('-') && !token.startsWith('+');
}

/**
 * Removes connect / reconnect style launch options that would put CS online.
 * Used for MIRV POV insecure recording so the game stays offline-only.
 */
export function sanitizeOfflineLaunchParameters(parameters: string[]): string[] {
  const result: string[] = [];

  for (let index = 0; index < parameters.length; index++) {
    const parameter = parameters[index];
    if (parameter.includes(' ')) {
      const cleaned = sanitizeOfflineLaunchParameterString(parameter);
      if (cleaned !== '') {
        result.push(cleaned);
      }
      continue;
    }

    if (isBlockedCommandToken(parameter)) {
      const next = parameters[index + 1];
      if (typeof next === 'string' && looksLikeCommandArgument(next) && !next.includes(' ')) {
        index += 1;
      }
      continue;
    }

    result.push(parameter);
  }

  return result;
}

export function sanitizeOfflineLaunchParameterString(value: string): string {
  const tokens = value.trim().split(/\s+/).filter(Boolean);
  const cleaned = sanitizeOfflineLaunchParameters(tokens);
  return cleaned.join(' ');
}
