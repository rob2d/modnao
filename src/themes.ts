import { PaletteMode, Theme, createTheme } from '@mui/material';
import { Fira_Code } from 'next/font/google';

export const firaCode = Fira_Code({
  subsets: ['latin'],
  weight: ['300', '400', '500']
});

const modes: PaletteMode[] = ['dark', 'light'];

declare module '@mui/material' {
  type SceneMeshPalette = {
    default: React.CSSProperties['color'];
    selected: React.CSSProperties['color'];
    flagged: React.CSSProperties['color'];
    textureDefault: React.CSSProperties['color'];
    textureSelected: React.CSSProperties['color'];
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
        fontFamily: firaCode.style.fontFamily
      },
      palette: {
        primary: {
          main: '#FF00F2',
          light: '#e98df5',
          contrastText: '#FFF'
        },
        secondary: {
          main: '#00A5FF',
          contrastText: '#FFF'
        },
        sceneMesh: {
          default: mode === 'dark' ? '#444' : '#CCC',
          selected: mode === 'dark' ? '#00A5FF' : '#e98df5',
          flagged: '#9BF',
          textureDefault: '#fff',
          textureSelected: mode === 'dark' ? '#9cf' : '#f9c'
        }
      }
    })
  ])
);

export default themes;
