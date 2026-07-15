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

export const firaCode = localFont({
  src: [
    {
      path: '../../public/fonts/FiraCodeLatin400.woff2',
      style: 'normal',
      weight: '400'
    },
    {
      path: '../../public/fonts/FiraCodeLatin600.woff2',
      style: 'normal',
      weight: '600'
    },
    {
      path: '../../public/fonts/FiraCodeLatin700.woff2',
      style: 'normal',
      weight: '700'
    }
  ],
  display: 'swap'
});

export const firaCodeFontFamily = firaCode.style.fontFamily;

const modes: PaletteMode[] = ['dark', 'light'];

type AppThemeMixin = SystemStyleObject<Theme>;

interface AppThemeMixins {
  dropShadowContrast: AppThemeMixin;
  dialogScrollEdgeFrame: AppThemeMixin;
  dialogScrollEdgeScroller: AppThemeMixin;
  fileDragActiveAfter: AppThemeMixin;
  fontFamilyMono: CSSProperties['fontFamily'];
  guiPanelExpansionL0W: CSSProperties['width'];
  guiPanelExpansionL1W: CSSProperties['width'];
  guiPanelExpansionL2W: CSSProperties['width'];
  guiPanelExpansionL3W: CSSProperties['width'];
}

interface AppThemeMixinsOptions {
  dropShadowContrast?: AppThemeMixin;
  dialogScrollEdgeFrame?: AppThemeMixin;
  dialogScrollEdgeScroller?: AppThemeMixin;
  fileDragActiveAfter?: AppThemeMixin;
  fontFamilyMono?: CSSProperties['fontFamily'];
  guiPanelExpansionL0W?: CSSProperties['width'];
  guiPanelExpansionL1W?: CSSProperties['width'];
  guiPanelExpansionL2W?: CSSProperties['width'];
  guiPanelExpansionL3W?: CSSProperties['width'];
}

declare module '@mui/material' {
  export type ScenePalette = {
    background: CSSProperties['color'];
    default: CSSProperties['color'];
    selected: CSSProperties['color'];
    flagged: CSSProperties['color'];
  };

  interface SceneControlPalette {
    background: CSSProperties['color'];
    selectedBackground: CSSProperties['color'];
    foreground: CSSProperties['color'];
  }

  interface PanelTexturePalette {
    background: CSSProperties['color'];
  }

  interface TypeText {
    deemphasized: CSSProperties['color'];
  }

  interface PaletteOptions {
    warningBackground: CSSProperties['color'];
    scene: ScenePalette;
    sceneControl: SceneControlPalette;
    panelTexture: PanelTexturePalette;
  }

  // note: redundancy is due to MUI typings
  interface Palette {
    warningBackground: CSSProperties['color'];
    scene: ScenePalette;
    sceneControl: SceneControlPalette;
    panelTexture: PanelTexturePalette;
  }
}

declare module '@mui/material/styles' {
  interface TypographyVariants {
    technical: CSSProperties;
  }

  interface TypographyVariantsOptions {
    technical?: CSSProperties;
  }

  interface Mixins extends AppThemeMixins {}

  interface MixinsOptions extends AppThemeMixinsOptions {}
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    technical: true;
  }
}

const mixins = {
  dropShadowContrast: {
    color: 'var(--mui-palette-common-white)',
    filter:
      'drop-shadow(2px 2px 1px color-mix(in srgb, var(--mui-palette-common-black) 70%, transparent))',
    mixBlendMode: 'luminosity'
  },
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
  fontFamilyMono: firaCodeFontFamily,
  guiPanelExpansionL0W: '32px',
  guiPanelExpansionL1W: '222px',
  guiPanelExpansionL2W: '388px',
  guiPanelExpansionL3W: '592px'
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
        technical: {
          fontSize: '0.775rem',
          fontWeight: 600,
          fontFamily: firaCodeFontFamily
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
        MuiToggleButtonGroup: {
          styleOverrides: {
            grouped: {
              '&.MuiButtonBase-root': {
                lineHeight: '1.0',
                paddingTop: 'calc(var(--mui-spacing) * 0.5)',
                paddingBottom: 'calc(var(--mui-spacing) * 0.5)'
              }
            }
          }
        },
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
              minHeight: '8px'
            }
          }
        },
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              backgroundColor: 'var(--mui-palette-background-paper)'
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
          deemphasized: 'rgba(var(--mui-palette-text-primaryChannel) / 0.4)'
        },
        warningBackground: 'rgba(255, 0, 0, 0.1)',
        info: {
          main:
            mode === 'dark'
              ? 'rgba(var(--mui-palette-text-primaryChannel) / 0.5)'
              : 'rgba(var(--mui-palette-text-primaryChannel) / 0.67)'
        },
        scene: {
          background: mode === 'dark' ? '#1c121c' : '#efefff',
          default: mode === 'dark' ? '#683C62' : '#AAC',
          selected: 'var(--mui-palette-secondary-light)',
          flagged: '#9BF'
        },
        sceneControl: {
          background:
            'color-mix(in srgb, var(--mui-palette-background-paper) 72%, transparent)',
          selectedBackground:
            'color-mix(in srgb, var(--mui-palette-secondary-main) 28%, transparent)',
          foreground: 'var(--mui-palette-common-white)'
        },
        panelTexture: {
          background: mode === 'dark' ? '#1d1b1d' : '#efefff'
        }
      }
    }
  ])
);

export default themes;
