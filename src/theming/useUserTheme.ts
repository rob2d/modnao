import { useContext, useMemo } from 'react';
import themes from '@/theming/themes';
import { createTheme, ScenePalette, Theme, useMediaQuery } from '@mui/material';
import SceneOptionsContext from '@/contexts/SceneOptionsContext';

const setupThemeOptions = (
  themeKey: 'light' | 'dark',
  scenePalette: Partial<ScenePalette> | undefined
) => {
  const theme = themes[themeKey];
  return {
    cssVariables: true,
    ...theme,
    palette: {
      ...(theme.palette || {}),
      scene: {
        ...(theme.palette || {}).scene,
        ...scenePalette
      }
    }
  };
};

export default function useUserTheme() {
  const sceneOptions = useContext(SceneOptionsContext);
  const { scenePalette, themeKey } = sceneOptions;
  const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const activeThemeKey = themeKey ?? (isDarkMode ? 'dark' : 'light');

  const themeApplied = useMemo<Theme>(
    () => createTheme(setupThemeOptions(activeThemeKey, scenePalette ?? {})),
    [scenePalette, activeThemeKey]
  );

  return themeApplied;
}
