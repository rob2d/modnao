import { useMediaQuery } from '@mui/material';

export default function useThemeMode() {
  return useMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light';
}
