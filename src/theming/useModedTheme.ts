import themes from '@/themes';
import { Theme, useMediaQuery } from '@mui/material';
import { useMemo } from 'react';

export default function useModedTheme() {
  const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme: Theme = useMemo(
    () => themes[isDarkMode ? 'dark' : 'light'],
    [isDarkMode]
  );

  return theme;
}
