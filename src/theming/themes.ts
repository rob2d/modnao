import { CSSProperties } from 'react';
import { PaletteMode, Theme, createTheme } from '@mui/material';
import { Fira_Code } from 'next/font/google';

export const firaCode = Fira_Code({
  subsets: ['latin'],
  weight: ['300', '400', '500']
});

const modes: PaletteMode[] = ['dark', 'light'];

declare module '@mui/material' {
  type ScenePalette = {
    background: CSSProperties['color'];
  };

  type SceneMeshPalette = {
    default: CSSProperties['color'];
    selected: CSSProperties['color'];
    flagged: CSSProperties['color'];
    textureDefault: CSSProperties['color'];
    textureSelected: CSSProperties['color'];
  };

  interface PanelTexturePalette {
    background: CSSProperties['color'];
  }

  interface PaletteOptions {
    scene: ScenePalette;
    sceneMesh: SceneMeshPalette;
    panelTexture: PanelTexturePalette;
  }

  // note: redundancy is due to MUI typings
  // perhaps should post an issue
  interface Palette {
    scene: ScenePalette;
    sceneMesh: SceneMeshPalette;
    panelTexture: PanelTexturePalette;
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
      components: {
        MuiToggleButton: {
          styleOverrides: {
            root: {
              color:
                mode === 'dark' ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)'
            }
          }
        }
      },
      palette: {
        mode,
        primary: {
          main: '#FF00F2',
          light: '#e98df5',
          contrastText: '#FFF'
        },
        secondary: {
          main: '#00A5FF',
          contrastText: '#FFF'
        },
        scene: {
          background: mode === 'dark' ? '#1c121c' : '#efefff'
        },
        sceneMesh: {
          default: mode === 'dark' ? '#683C62' : '#AAC',
          selected: mode === 'dark' ? '#00A5FF' : '#e98df5',
          flagged: '#9BF',
          textureDefault: '#fff',
          textureSelected: mode === 'dark' ? '#9cf' : '#f9c'
        },
        panelTexture: {
          background: mode === 'dark' ? '#1d1b1d' : '#efefff'
        }
      }
    })
  ])
);

export default themes;
