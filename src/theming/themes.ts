import { PaletteMode, Theme } from '@mui/material';
import { CSSProperties } from 'react';
import { Roboto_Mono } from 'next/font/google';

export const robotoMono = Roboto_Mono({
  display: 'block',
  subsets: ['latin'],
  weight: ['300', '400', '700']
});

const modes: PaletteMode[] = ['dark', 'light'];

declare module '@mui/material' {
  export type ScenePalette = {
    background: CSSProperties['color'];
    default: CSSProperties['color'];
    selected: CSSProperties['color'];
    flagged: CSSProperties['color'];
  };

  interface PanelTexturePalette {
    background: CSSProperties['color'];
  }

  interface PaletteOptions {
    warningBackground: CSSProperties['color']
    scene: ScenePalette;
    panelTexture: PanelTexturePalette;
  }

  // note: redundancy is due to MUI typings
  interface Palette {
    warningBackground: CSSProperties['color']
    scene: ScenePalette;
    panelTexture: PanelTexturePalette;
    
  }
}

export type AppThemes = {
  [key in PaletteMode]: Theme;
};

const themes = Object.fromEntries(
  modes.map((mode) => [
    mode,
    {
      typography: {
        fontFamily: robotoMono.style.fontFamily
      },
      components: {
        MuiCssBaseline: {},
        MuiListSubheader: {
          styleOverrides: {
            root: {
              backgroundColor: 'inherit'
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
        warningBackground: 'rgba(255, 0, 0, 0.1)',
        info: {
          main: mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
        },
        scene: {
          background: mode === 'dark' ? '#1c121c' : '#efefff',
          default: mode === 'dark' ? '#683C62' : '#AAC',
          selected: '#FF00F2',
          flagged: '#9BF'
        },
        panelTexture: {
          background: mode === 'dark' ? '#1d1b1d' : '#efefff'
        }
      }
    }
  ])
);

export default themes;
