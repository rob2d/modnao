import { useContext, useMemo } from 'react';
import themes from '@/theming/themes';
import { createTheme, ScenePalette, Theme, useMediaQuery } from '@mui/material';
import ViewOptionsContext from '@/contexts/ViewOptionsContext';

const setupThemeOptions = (
  isDarkMode: boolean,
  scenePalette: Partial<ScenePalette> | undefined
) => {
  const theme = themes[isDarkMode ? 'dark' : 'light'];
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
  const viewOptions = useContext(ViewOptionsContext);
  const { scenePalette, themeKey } = viewOptions;
  const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const themeApplied = useMemo<Theme>(
    () => createTheme(setupThemeOptions(isDarkMode, scenePalette ?? {})),
    [scenePalette, themeKey, isDarkMode]
  );

  return themeApplied;
}
