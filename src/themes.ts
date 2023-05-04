import { PaletteMode, Theme, createTheme } from '@mui/material';
import { Roboto } from 'next/font/google';

export const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500']
});

const modes: PaletteMode[] = ['dark', 'light'];

declare module '@mui/material' {
  type SceneMeshPalette = {
    default: React.CSSProperties['color'];
    highlighted: React.CSSProperties['color'];
    selected: React.CSSProperties['color'];
  };
  interface PaletteOptions {
    sceneMesh: SceneMeshPalette;
  }

  interface Palette {
    sceneMesh: SceneMeshPalette;
  }
}

export type AppThemes = {
  [key in PaletteMode]: Theme;
};

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
          contrastText: '#FFF'
        },
        secondary: {
          main: '#00A5FF',
          contrastText: '#FFF'
        },
        sceneMesh: {
          default: mode === 'dark' ? '#444' : '#CCC',
          selected: mode === 'dark' ? '#00A5FF' : '#FF00F2',
          highlighted: mode === 'dark' ? '#666' : '#AAA'
        }
      }
    })
  ])
) as AppThemes;

export default themes;
