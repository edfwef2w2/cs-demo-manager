export const ThemeName = {
  System: 'system',
  Dark: 'dark',
  Light: 'light',
} as const;

export type ThemeName = (typeof ThemeName)[keyof typeof ThemeName];
