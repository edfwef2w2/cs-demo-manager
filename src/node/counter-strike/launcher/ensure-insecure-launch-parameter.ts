export function ensureInsecureLaunchParameter(parameters: string[]) {
  const hasInsecure = parameters.some((parameter) => {
    return parameter === '-insecure' || /(^|\s)-insecure(\s|$)/.test(parameter);
  });
  if (hasInsecure) {
    return parameters;
  }

  return ['-insecure', ...parameters];
}
