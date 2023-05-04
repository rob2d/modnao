import { PaletteMode, Theme, createTheme } from '@mui/material';
import { Roboto } from 'next/font/google';

export const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500']
});

export type AppThemes = {
  [key in PaletteMode]: Theme;
};

const modes: PaletteMode[] = ['dark', 'light'];

const themes = Object.fromEntries(
  modes.map((mode) => [
    mode,
    createTheme({
      typography: {
        fontFamily: roboto.style.fontFamily
      },
      palette: {
        primary: {
          main: '#FF00F2',
          contrastText: '#fff'
        },
        secondary: {
          main: '#00A5FF',
          contrastText: '#fff'
        }
      }
    })
  ])
) as AppThemes;

export default themes;
