import { CSSProperties } from 'react';
import type {} from '@mui/material/themeCssVarsAugmentation';
import { PaletteMode } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import type { SystemStyleObject } from '@mui/system';
import localFont from 'next/font/local';

export const robotoMono = localFont({
  src: [{ path: '../../public/fonts/RobotoMono-VariableFont_wght.ttf' }]
});

const modes: PaletteMode[] = ['dark', 'light'];

type AppThemeMixin = SystemStyleObject<Theme>;

interface AppThemeMixins {
  dialogScrollEdgeFrame: AppThemeMixin;
  dialogScrollEdgeScroller: AppThemeMixin;
  fileDragActiveAfter: AppThemeMixin;
}

interface AppThemeMixinsOptions {
  dialogScrollEdgeFrame?: AppThemeMixin;
  dialogScrollEdgeScroller?: AppThemeMixin;
  fileDragActiveAfter?: AppThemeMixin;
}

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

  interface TypeText {
    hoverHint: CSSProperties['color'];
  }

  interface PaletteOptions {
    warningBackground: CSSProperties['color'];
    scene: ScenePalette;
    panelTexture: PanelTexturePalette;
  }

  // note: redundancy is due to MUI typings
  interface Palette {
    warningBackground: CSSProperties['color'];
    scene: ScenePalette;
    panelTexture: PanelTexturePalette;
  }
}

declare module '@mui/material/styles' {
  interface Mixins extends AppThemeMixins {}

  interface MixinsOptions extends AppThemeMixinsOptions {}
}

const mixins = {
  dialogScrollEdgeFrame: {
    position: 'relative',
    boxSizing: 'border-box',
    height: '100%',
    minHeight: 0,
    overflow: 'hidden',
    borderTop: '1px solid transparent',
    borderBottom: '1px solid transparent',
    transition: 'border-color 160ms ease',
    '&::before, &::after': {
      content: '""',
      position: 'absolute',
      left: 0,
      right: 0,
      height: 'calc(var(--mui-spacing) * 3)',
      pointerEvents: 'none',
      zIndex: 2,
      opacity: 0,
      transition: 'opacity 160ms ease'
    },
    '&::before': {
      top: 0,
      background:
        'linear-gradient(to bottom, rgb(0 0 0 / 0.03), rgb(0 0 0 / 0.015), rgb(0 0 0 / 0))'
    },
    '&::after': {
      bottom: 0,
      background:
        'linear-gradient(to top, rgb(0 0 0 / 0.03), rgb(0 0 0 / 0.015), rgb(0 0 0 / 0))'
    },
    '&[data-scroll-above="true"]': {
      '&::before': {
        opacity: 'var(--dialog-scroll-edge-top-opacity, 1)'
      }
    },
    '&[data-scroll-below="true"]': {
      '&::after': {
        opacity: 'var(--dialog-scroll-edge-bottom-opacity, 1)'
      }
    }
  } satisfies AppThemeMixin,
  dialogScrollEdgeScroller: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto'
  } satisfies AppThemeMixin,
  fileDragActiveAfter: {
    content: "''",
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'var(--mui-palette-secondary-light)',
    border: '3px solid var(--mui-palette-secondary-main)',
    mixBlendMode: 'hard-light',
    opacity: 0.75,
    pointerEvents: 'none'
  } satisfies AppThemeMixin
} satisfies AppThemeMixins;

export type AppThemes = {
  [key in PaletteMode]: Theme;
};

const themes = Object.fromEntries(
  modes.map((mode) => [
    mode,
    {
      typography: {
        fontFamily: robotoMono.style.fontFamily,
        h6: {
          fontFamily: 'Neue Aachen Pro Medium, sans-serif'
        }
      },
      mixins,
      components: {
        MuiListSubheader: {
          styleOverrides: {
            root: {
              backgroundColor: 'inherit',
              lineHeight: 'unset'
            }
          }
        },
        MuiAlert: {
          styleOverrides: {
            icon: {
              fontSize: '28px',
              alignItems: 'center'
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
        text: {
          hoverHint: 'rgba(0, 0, 0, 0.3)'
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
