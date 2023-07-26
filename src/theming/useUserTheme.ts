import { useEffect, useState } from 'react';
import themes from '@/theming/themes';
import { Theme, useMediaQuery, createTheme, ScenePalette } from '@mui/material';
import { ThemeOptions } from '@mui/material/styles';

let hasInitialized = false;

const setupThemeOptions = (
  isDarkMode: boolean,
  scenePalette: Partial<ScenePalette>
) => {
  const theme = themes[isDarkMode ? 'dark' : 'light'];
  const themeOptions = {
    ...theme,
    palette: {
      ...(theme.palette || {}),
      scene: {
        ...(theme.palette || {}).scene,
        ...scenePalette
      }
    }
  } as ThemeOptions;

  return createTheme(themeOptions);
};

export default function useUserTheme(scenePalette: Partial<ScenePalette>) {
  const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [themeApplied, setThemeApplied] = useState<Theme>(
    createTheme(setupThemeOptions(isDarkMode, scenePalette))
  );

  useEffect(() => {
    if (!hasInitialized) {
      hasInitialized = true;
      return;
    }
    setThemeApplied(setupThemeOptions(isDarkMode, scenePalette));
  }, [isDarkMode, scenePalette]);

  return themeApplied;
}
