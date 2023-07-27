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

export default function useUserTheme(
  scenePalette: Partial<ScenePalette>,
  lightOrDark?: 'light' | 'dark'
) {
  const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [themeApplied, setThemeApplied] = useState<Theme>(
    createTheme(
      setupThemeOptions(
        lightOrDark !== undefined ? lightOrDark === 'dark' : isDarkMode,
        scenePalette
      )
    )
  );

  useEffect(() => {
    if (!hasInitialized) {
      hasInitialized = true;
      return;
    }

    setThemeApplied(
      setupThemeOptions(
        lightOrDark !== undefined ? lightOrDark === 'dark' : isDarkMode,
        scenePalette
      )
    );
  }, [isDarkMode, scenePalette, lightOrDark]);

  return themeApplied;
}
