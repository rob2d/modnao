import { CSSProperties } from 'react';
import type {} from '@mui/material/themeCssVarsAugmentation';
import { PaletteMode } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import type { SystemStyleObject } from '@mui/system';
import localFont from 'next/font/local';

export const robotoMono = localFont({
  src: [{ path: '../../public/fonts/RobotoMono-VariableFont_wght.ttf' }]
});

export const publicSans = localFont({
  src: [
    {
      path: '../../public/fonts/PublicSans-VariableFont_wght.ttf',
      style: 'normal',
      weight: '100 900'
    },
    {
      path: '../../public/fonts/PublicSans-Italic-VariableFont_wght.ttf',
      style: 'italic',
      weight: '100 900'
    }
  ],
  display: 'swap'
});

const modes: PaletteMode[] = ['dark', 'light'];

type AppThemeMixin = SystemStyleObject<Theme>;

interface AppThemeMixins {
  dialogScrollEdgeFrame: AppThemeMixin;
  dialogScrollEdgeScroller: AppThemeMixin;
  fileDragActiveAfter: AppThemeMixin;
  sceneIconMixin: AppThemeMixin;
}

interface AppThemeMixinsOptions {
  dialogScrollEdgeFrame?: AppThemeMixin;
  dialogScrollEdgeScroller?: AppThemeMixin;
  fileDragActiveAfter?: AppThemeMixin;
  sceneIconMixin?: AppThemeMixin;
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
    deemphasized: CSSProperties['color'];
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
  },
  dialogScrollEdgeScroller: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto'
  },
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
  },
  sceneIconMixin: {
    color: 'var(--mui-palette-common-white)',
    filter: 'drop-shadow(2px 2px 1px rgba(0,0,0,0.5))',
    mixBlendMode: 'luminosity'
  }
} satisfies AppThemeMixins;

export type AppThemes = {
  [key in PaletteMode]: Theme;
};

const themes = Object.fromEntries(
  modes.map((mode) => [
    mode,
    {
      typography: {
        root: {
          fontSize: '0.875rem'
        },
        fontFamily: publicSans.style.fontFamily,
        body1: {
          fontSize: '0.875rem'
        },
        body2: {
          fontSize: '0.775rem'
        },
        subtitle1: {
          fontSize: '0.875rem',
          fontWeight: 600
        },
        subtitle2: {
          fontSize: '0.775rem',
          fontWeight: 600
        },
        h5: {
          fontSize: '1.25rem',
          fontFamily: 'Neue Aachen Pro Medium, sans-serif'
        },
        h6: {
          fontSize: '1rem',
          fontFamily: 'Neue Aachen Pro Medium, sans-serif'
        },
        button: {
          fontSize: '0.775rem'
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
        },
        MuiButton: {
          styleOverrides: {
            root: {
              fontSize: '0.725rem',
              fontWeight: 500
            }
          }
        },
        MuiStepLabel: {
          styleOverrides: {
            label: {
              '&.Mui-completed,&.Mui-active': {
                fontWeight: 700,
                fontSize: '0.875rem'
              }
            },
            root: {
              '&.MuiStepLabel-vertical': {
                padding: '4px 0px'
              }
            }
          }
        },
        MuiStepConnector: {
          styleOverrides: {
            line: {
              minHeight: '12px'
            }
          }
        }
      },
      palette: {
        mode,
        primary: {
          main: '#e800dd',
          light: '#e98df5',
          contrastText: '#FFF'
        },
        secondary: {
          main: '#00A5FF',
          contrastText: '#FFF'
        },
        text: {
          deemphasized: 'rgba(0, 0, 0, 0.4)'
        },
        warningBackground: 'rgba(255, 0, 0, 0.1)',
        info: {
          main: mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.67)'
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
