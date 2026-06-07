import Img from 'next/image';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import { Divider, Paper } from '@mui/material';
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

const PANEL_WIDTHS = [32, 222, 388, 222 + 174 * 2 + 22];
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

const usePanelDragState = (sceneOptions: SceneOptions): PanelDragParams => {
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

    if (isMouseDown && !hasDragged.current) {
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
  const [resizeMouseDown, resizeHandle] = usePanelDragState(sceneOptions);
  const expansionLevel = sceneOptions.enableCinematicMode
    ? 0
    : clamp(
        sceneOptions.guiPanelExpansionLevel,
        contentViewMode === 'welcome' ? 1 : 0,
        2
      );

  const onClickResizeHandle = useCallback(() => {
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
      sx={{
        position: 'relative',
        height: '100vh',
        transition: `opacity ${TRANSITION_TIME} ease, width ${TRANSITION_TIME} ease`,
        opacity: 1,
        pointerEvents: 'all',
        overflow: 'hidden',
        width: `${PANEL_WIDTHS[1]}px`,
        flexShrink: 0,
        '&.collapsed:not(.welcome):not(:hover)': {
          opacity: 0
        },
        '&.collapsed': {
          width: `${PANEL_WIDTHS[0]}px`,
          flexShrink: 0
        },
        '&.expanded-1': {
          width: `${PANEL_WIDTHS[2]}px`
        },
        '&.expanded-2': {
          width: `${PANEL_WIDTHS[3]}px`
        },
        '& > .content': {
          containerName: 'panel',
          containerType: 'normal',
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
          opacity: 1,
          transition: `opacity ${TRANSITION_TIME} ease`
        },
        '&.collapsed:not(.welcome)': {
          position: 'absolute',
          top: 0,
          right: 0
        },
        '&.collapsed:not(.welcome) > .content': {
          opacity: 0
        },
        '& .content .MuiToggleButtonGroup-root:not(:first-item):not(.display-mode)':
          {
            mt: 1
          },
        '& .content .MuiToggleButtonGroup-root': {
          mb: 1
        },
        '& .content .MuiToggleButtonGroup-root .MuiButtonBase-root': {
          width: '100%',
          justifyContent: 'center'
        },
        '& .content > .MuiTypography-subtitle2, & .content > :not(.MuiDivider-root):not(.textures)':
          {
            width: '100%'
          },
        '&.expanded .content #select-pol-or-tex-button': {
          mb: 0
        },
        '& .property-table *:nth-of-type(even)': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end'
        },
        '& .settings-row': {
          display: 'flex',
          justifyContent: 'flex-end'
        },
        '& .textures': {
          width: 'calc(100% + (var(--mui-spacing) * 4))',
          mx: -2,
          pl: 2,
          mb: 0,
          flexGrow: 2,
          overflowY: 'auto'
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
        '& .MuiButton-root.MuiButton-outlined:not(:last-child), &.panel:not(.expanded) .export-texture-button-container:not(:last-child), &.panel:not(.expanded) .export-texture-images:not(:last-child)':
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
        '& .MuiIconButton-root.model-nav-button': {
          width: '28px'
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
          }
        }
      }}
    >
      <div
        className={clsx('resize-handle', resizeMouseDown && 'active')}
        ref={resizeHandle}
        onClick={onClickResizeHandle}
      >
        <ExpandLevelIcon fontSize='small' />
      </div>
      <div className='content'>
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
      </div>
    </Paper>
  );
}
