import Img from 'next/image';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import { Box, Divider, Paper } from '@mui/material';
import { RefObject, useCallback, useContext, useEffect, useRef } from 'react';
import clsx from 'clsx';
import SceneOptionsContext, {
  SceneOptions
} from '@/contexts/SceneOptionsContext';
import GuiPanelViewOptions from './GuiPanelSceneOptions';
import GuiPanelTextures from './GuiPanelTextures';
import GuiPanelModels from './GuiPanelModels';
import {
  selectContentViewMode,
  selectHasLoadedPolygonFile,
  selectLoadTexturesState
} from '@/selectors';
import { useAppSelector } from '@/storeTypings';
import { useDragMouseOnEl } from '@/hooks';

const TRANSITION_TIME = `0.32s`;

const expandLevelIcons = [
  KeyboardDoubleArrowLeftIcon,
  FirstPageIcon,
  KeyboardDoubleArrowRightIcon
];

const PANEL_DRAG_THRESHOLD = 24;

function clamp(num: number, min: number, max: number) {
  return Math.min(Math.max(num, min), max);
}

type PanelDragParams = [boolean, RefObject<HTMLDivElement | null>];

const usePanelDragState = (
  sceneOptions: SceneOptions,
  canResizePanel: boolean
): PanelDragParams => {
  const resizeHandle = useRef<HTMLDivElement | null>(null);
  const [dragMouseXY, isMouseDown, resetMouseTracking] =
    useDragMouseOnEl(resizeHandle);
  const levelAtStart = useRef<number>(sceneOptions.guiPanelExpansionLevel);
  const hasDragged = useRef<boolean>(false);

  useEffect(() => {
    if (isMouseDown) {
      levelAtStart.current = sceneOptions.guiPanelExpansionLevel;
    } else {
      hasDragged.current = false;
    }
  }, [isMouseDown]);

  useEffect(() => {
    const {
      enableCinematicMode,
      guiPanelExpansionLevel,
      setEnableCinematicMode,
      setGuiPanelExpansionLevel
    } = sceneOptions;

    if (isMouseDown && canResizePanel && !hasDragged.current) {
      const dragStepDelta = Math.round(dragMouseXY.x / PANEL_DRAG_THRESHOLD);

      if (enableCinematicMode) {
        if (dragStepDelta < 0) {
          setEnableCinematicMode(false);
          hasDragged.current = true;
        }

        return;
      }

      const targetLevel = clamp(
        levelAtStart.current - dragStepDelta,
        Math.max(levelAtStart.current - 1, 0),
        Math.min(levelAtStart.current + 1, 2)
      );

      if (targetLevel !== guiPanelExpansionLevel) {
        setGuiPanelExpansionLevel(targetLevel);
        hasDragged.current = true;

        setTimeout(() => {
          resetMouseTracking();
        }, 350);
      }
    }
  }, [
    dragMouseXY,
    isMouseDown,
    canResizePanel,
    resetMouseTracking,
    sceneOptions.enableCinematicMode,
    sceneOptions.guiPanelExpansionLevel,
    sceneOptions.setEnableCinematicMode,
    sceneOptions.setGuiPanelExpansionLevel
  ]);

  return [isMouseDown, resizeHandle];
};

export default function GuiPanel() {
  const sceneOptions = useContext(SceneOptionsContext);
  const contentViewMode = useAppSelector(selectContentViewMode);
  const loadTexturesState = useAppSelector(selectLoadTexturesState);
  const hasLoadedPolygonFile = useAppSelector(selectHasLoadedPolygonFile);
  const canResizePanel = contentViewMode !== 'welcome';
  const [resizeMouseDown, resizeHandle] = usePanelDragState(
    sceneOptions,
    canResizePanel
  );

  let expansionLevel = clamp(sceneOptions.guiPanelExpansionLevel, 0, 2);

  if (sceneOptions.enableCinematicMode) {
    expansionLevel = 0;
  }

  if (contentViewMode === 'welcome') {
    expansionLevel = 1;
  }

  const onClickResizeHandle = useCallback(() => {
    if (!canResizePanel) {
      return;
    }

    if (sceneOptions.enableCinematicMode) {
      sceneOptions.setEnableCinematicMode(false);
      return;
    }

    switch (sceneOptions.guiPanelExpansionLevel) {
      case 0:
        sceneOptions.setGuiPanelExpansionLevel(1);
        break;
      case 1:
        sceneOptions.setGuiPanelExpansionLevel(2);
        break;
      case 2:
        sceneOptions.setGuiPanelExpansionLevel(1);
        break;
    }
  }, [
    canResizePanel,
    sceneOptions.enableCinematicMode,
    sceneOptions.guiPanelExpansionLevel,
    sceneOptions.setEnableCinematicMode,
    sceneOptions.setGuiPanelExpansionLevel
  ]);

  const ExpandLevelIcon = expandLevelIcons[expansionLevel];

  return (
    <Paper
      square
      className={clsx(
        'panel',
        contentViewMode,
        'visible',
        expansionLevel === 0 && 'collapsed',
        expansionLevel > 1 && 'expanded',
        expansionLevel > 1 && `expanded-${expansionLevel - 1}`
      )}
      sx={({ mixins }) => ({
        position: 'relative',
        height: '100vh',
        transition: `opacity ${TRANSITION_TIME} ease, width ${TRANSITION_TIME} ease`,
        opacity: 1,
        pointerEvents: 'all',
        overflow: 'hidden',
        width: mixins.guiPanelExpansionL1W,
        flexShrink: 0,
        '&.collapsed:not(.welcome):not(:hover)': {
          opacity: 0
        },
        '&.collapsed': {
          width: mixins.guiPanelExpansionL0W,
          flexShrink: 0
        },
        '&.expanded-1': {
          width: mixins.guiPanelExpansionL2W
        },
        '&.expanded-2': {
          width: mixins.guiPanelExpansionL3W
        },
        '&.collapsed:not(.welcome)': {
          position: 'absolute',
          top: 0,
          right: 0
        },
        '& .property-table *:nth-of-type(even)': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end'
        },
        '& .view-options': {
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          flexGrow: 0
        },
        '& .MuiButton-root.MuiButton-outlined': {
          justifyContent: 'center'
        },
        '& .MuiButton-root.MuiButton-outlined, &.panel:not(.expanded) .export-texture-button-container:not(:last-child), &.panel:not(.expanded) .export-texture-images:not(:last-child)':
          {
            mb: 1
          },
        '& .texture-export-options': {
          display: 'flex',
          flexDirection: 'column',
          my: 1
        },
        '&.expanded .texture-export-options': {
          flexDirection: 'row'
        },
        '&.expanded .texture-export-options > *:nth-child(1)': {
          mr: 1
        },
        '&.expanded .texture-export-options > *': {
          flexBasis: '50%'
        },
        '&.textures.expanded .texture-export-options > .export-texture-images':
          {
            flexBasis: '50%'
          },
        '& .grid-control-label': {
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center'
        },
        '&.collapsed .resize-handle': {
          width: '100%'
        },
        '& .resize-handle': {
          userSelect: 'none',
          cursor: 'col-resize',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '16px',
          height: '100%',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'transparent',
          transition: `background-color ${TRANSITION_TIME} ease`,
          '&:hover': {
            backgroundColor: 'var(--mui-palette-action-hover)'
          },
          '&.active': {
            backgroundColor: 'var(--mui-palette-action-selected)'
          },
          '& svg': {
            color: 'var(--mui-palette-text-deemphasized)',
            opacity: 0
          },
          '&:hover svg, &.active svg': {
            opacity: 1,
            transition: `opacity ${TRANSITION_TIME} ease`
          },
          '&.disabled': {
            cursor: 'default',
            pointerEvents: 'none'
          },
          '&.disabled:hover': {
            backgroundColor: 'transparent'
          },
          '&.disabled svg': {
            opacity: 0
          }
        }
      })}
    >
      <div
        className={clsx(
          'resize-handle',
          resizeMouseDown && canResizePanel && 'active',
          !canResizePanel && 'disabled'
        )}
        ref={resizeHandle}
        onClick={onClickResizeHandle}
      >
        <ExpandLevelIcon fontSize='small' />
      </div>
      <Box
        sx={{
          containerName: 'panel',
          containerType: 'inline-size',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          boxSizing: 'border-box',
          px: 2,
          py: 0,
          opacity:
            expansionLevel === 0 && contentViewMode !== 'welcome' ? 0 : 1,
          transition: `opacity ${TRANSITION_TIME} ease`,

          '& > .MuiTypography-subtitle2, & > :not(.MuiDivider-root):not(.textures)':
            {
              width: '100%'
            },
          ...(expansionLevel > 1
            ? {
                '& #select-pol-or-tex-button': {
                  mb: 0
                }
              }
            : undefined)
        }}
        className='content'
      >
        {contentViewMode !== 'welcome' ? undefined : (
          <Img
            alt='logo'
            src='/logo.svg'
            width={222}
            height={172}
            loading='eager'
            style={{ height: 'auto' }}
          />
        )}
        {contentViewMode !== 'textures' ? (
          <>
            <GuiPanelModels />
            {loadTexturesState === 'idle' ? undefined : (
              <>
                <Divider flexItem />
                <GuiPanelTextures />
              </>
            )}
          </>
        ) : (
          <>
            <GuiPanelTextures />
            <GuiPanelModels />
          </>
        )}
        {!hasLoadedPolygonFile ? undefined : (
          <>
            <Divider flexItem />
            <GuiPanelViewOptions />
          </>
        )}
      </Box>
    </Paper>
  );
}
