import { useContext, useLayoutEffect, useState } from 'react';
import themes from '@/theming/themes';
import { createTheme, ScenePalette, Theme, useMediaQuery } from '@mui/material';
import { ThemeOptions } from '@mui/material/styles';
import ViewOptionsContext from '@/contexts/ViewOptionsContext';

let hasInitialized = false;

const setupThemeOptions = (
  isDarkMode: boolean,
  scenePalette: Partial<ScenePalette> | undefined
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

export default function useUserTheme() {
  const viewOptions = useContext(ViewOptionsContext);
  const { scenePalette, themeKey: lightOrDark } = viewOptions;
  const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [themeApplied, setThemeApplied] = useState<Theme>(
    createTheme(setupThemeOptions(isDarkMode, scenePalette))
  );

  useLayoutEffect(() => {
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
