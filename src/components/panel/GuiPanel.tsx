import Img from 'next/image';
import Icon from '@mdi/react';
import { Divider, Paper, styled } from '@mui/material';
import {
  LegacyRef,
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useRef
} from 'react';
import clsx from 'clsx';
import ViewOptionsContext, { ViewOptions } from '@/contexts/ViewOptionsContext';
import GuiPanelViewOptions from './GuiPanelViewOptions';
import GuiPanelTextures from './GuiPanelTextures';
import GuiPanelModels from './GuiPanelModels';
import {
  selectContentViewMode,
  selectHasLoadedPolygonFile,
  selectLoadTexturesState,
  useAppSelector
} from '@/store';
import {
  mdiArrowExpandHorizontal,
  mdiArrowExpandLeft,
  mdiArrowExpandRight
} from '@mdi/js';
import { useDragMouseOnEl } from '@/hooks';

const PANEL_WIDTHS = [32, 222, 388, 222 + 174 * 2 + 22];
const TRANSITION_TIME = `0.32s`;

const expandLevelIcons = [
  mdiArrowExpandLeft,
  mdiArrowExpandHorizontal,
  mdiArrowExpandRight
];

const StyledPaper = styled(Paper)(
  {
    shouldForwardProp: (prop: string) =>
      prop !== 'textColor' && prop !== 'buttonTextColor'
  },
  ({ theme }) => `
    &.MuiPaper-root {
      position: relative;
      height: 100vh;
      transition: opacity ${TRANSITION_TIME} ease, width ${TRANSITION_TIME} ease;
      opacity: 1;
      pointer-events: all;
      overflow: hidden;
    }

    &.collapsed:not(.welcome):not(:hover) {
      opacity: 0;
    }

    &.MuiPaper-root {
      width: ${PANEL_WIDTHS[1]}px;
      flex-shrink: 0;
    }

    &.MuiPaper-root.collapsed {
      width: ${PANEL_WIDTHS[0]}px;
      flex-shrink: 0;
    }

    &.MuiPaper-root.expanded-1 {
      width: ${PANEL_WIDTHS[2]}px;
    }

    &.MuiPaper-root.expanded-2 {
      width: ${PANEL_WIDTHS[3]}px;
    }

    & > .content {
      container-name: panel;
      container-type: normal;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100vh;
      flex-shrink: 0;
      
      display: flex;
      flex-direction: column; 
      align-items: flex-end;
      box-sizing: border-box;
      padding-left: ${theme.spacing(2)};
      padding-right: ${theme.spacing(2)};
      padding-top: 0;
      padding-bottom: 0;
    }

    & > .content {
      width: 100%;
      opacity: 1;
      transition: opacity ${TRANSITION_TIME} ease;
    }

    &.collapsed:not(.welcome) {
      position: absolute;
      top: 0;
      right: 0;
    }

    &.collapsed:not(.welcome) > .content {
      opacity: 0;
    }

    & .content .MuiToggleButtonGroup-root:not(:first-item):not(.display-mode) {
      margin-top: ${theme.spacing(1)};
    }

    & .content .MuiToggleButtonGroup-root {
      margin-bottom: ${theme.spacing(1)};
    }

    & .content .MuiToggleButtonGroup-root .MuiButtonBase-root {
      width: 100%;
      justify-content: center;
    }

    & .content > .MuiTypography-subtitle2, & .content > :not(.MuiDivider-root):not(.textures) {
      width: 100%;
    }

    &.expanded .content #select-pol-or-tex-button {
      margin-bottom: 0px;
    }

    & .property-table *:nth-of-type(even) {
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }

    & .settings-row {
      display: flex;
      justify-content: flex-end;
    }

    & .textures {
      width: calc(100% + (${theme.spacing(2)} * 2));
      margin-left: -${theme.spacing(2)};
      margin-right: -${theme.spacing(2)};
      padding-left: ${theme.spacing(2)};
      margin-bottom: 0;
      flex-grow: 2;
      overflow-y: auto;
    }

    & .view-options {
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      flex-grow: 0;
    }

    & .MuiButton-root.MuiButton-outlined {
      justify-content: center;
    }

    & .MuiButton-root.MuiButton-outlined:not(:last-child),
    &.panel:not(.expanded) .export-texture-button-container:not(:last-child),
    &.panel:not(.expanded) .export-texture-images:not(:last-child) {
      margin-bottom: ${theme.spacing(1)};
    }

    & .texture-export-options {
      display: flex;
      flex-direction: column;
      margin-top: ${theme.spacing(1)};
      margin-bottom: ${theme.spacing(1)};
    }

    &.expanded .texture-export-options {
      flex-direction: row;
    }

    &.expanded .texture-export-options > *:nth-child(1) {
      margin-right: ${theme.spacing(1)};
    }

    &.expanded .texture-export-options > * {
      flex-basis: 50%;
    }

    &.textures.expanded .texture-export-options > .export-texture-images {
      flex-basis: 100%;
    }

    & .MuiIconButton-root.model-nav-button {
      width: 28px;
    }

    & .grid-control-label {
      display: flex;
      justify-content: flex-start;
      align-items: center;
    }

    &.collapsed .resize-handle {
      width: calc(100%);
    }

    & .resize-handle {
      user-select: none;
      cursor: col-resize;
      position: absolute;
      top: 0;
      left: 0px;
      width: 16px;
      height: 100%;
      z-index: 1;

      display: flex;
      align-items: center;
      justify-content: center;

      background-color: transparent;
      transition: background-color ${TRANSITION_TIME} ease;

      &:hover {
        background-color: ${theme.palette.action.hover};
      }

      &.active {
        background-color: ${theme.palette.action.selected};
      }

      & svg {
        color: ${theme.palette.text.hoverHint};
        opacity: 0;
      }

      &:hover svg, &.active svg {
        opacity: 1;
        transition: opacity ${TRANSITION_TIME} ease;
      }
    }
  `
);

const PANEL_DRAG_THRESHOLD = 24;

function clamp(num: number, min: number, max: number) {
  return Math.min(Math.max(num, min), max);
}

type PanelDragParams = [boolean, RefObject<HTMLElement | null>];

const usePanelDragState = (viewOptions: ViewOptions): PanelDragParams => {
  const resizeHandle = useRef<HTMLElement | null>(null);
  const [dragMouseXY, isMouseDown, resetMouseTracking] =
    useDragMouseOnEl(resizeHandle);
  const levelAtStart = useRef<number>(viewOptions.guiPanelExpansionLevel);
  const hasDragged = useRef<boolean>(false);

  useEffect(() => {
    if (isMouseDown) {
      levelAtStart.current = viewOptions.guiPanelExpansionLevel;
    } else {
      hasDragged.current = false;
    }
  }, [isMouseDown]);

  useEffect(() => {
    const { guiPanelExpansionLevel, setGuiPanelExpansionLevel } = viewOptions;

    if (isMouseDown && !hasDragged.current) {
      const dragStepDelta = Math.round(dragMouseXY.x / PANEL_DRAG_THRESHOLD);

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
  }, [isMouseDown && dragMouseXY]);

  return [isMouseDown, resizeHandle];
};

export default function GuiPanel() {
  const viewOptions = useContext(ViewOptionsContext);
  const contentViewMode = useAppSelector(selectContentViewMode);
  const loadTexturesState = useAppSelector(selectLoadTexturesState);
  const hasLoadedPolygonFile = useAppSelector(selectHasLoadedPolygonFile);
  const [resizeMouseDown, resizeHandle] = usePanelDragState(viewOptions);
  const expansionLevel = clamp(
    viewOptions.guiPanelExpansionLevel,
    contentViewMode === 'welcome' ? 1 : 0,
    2
  );

  const onClickResizeHandle = useCallback(() => {
    switch (viewOptions.guiPanelExpansionLevel) {
      case 0:
        viewOptions.setGuiPanelExpansionLevel(1);
        break;
      case 1:
        viewOptions.setGuiPanelExpansionLevel(2);
        break;
      case 2:
        viewOptions.setGuiPanelExpansionLevel(1);
        break;
    }
  }, [viewOptions.guiPanelExpansionLevel]);

  return (
    <StyledPaper
      square
      className={clsx(
        'panel',
        contentViewMode,
        'visible',
        expansionLevel === 0 && 'collapsed',
        expansionLevel > 1 && 'expanded',
        expansionLevel > 1 && `expanded-${expansionLevel - 1}`
      )}
    >
      <div
        className={clsx('resize-handle', resizeMouseDown && 'active')}
        ref={resizeHandle as LegacyRef<HTMLDivElement>}
        onClick={onClickResizeHandle}
      >
        <Icon path={expandLevelIcons[expansionLevel]} size={0.75} />
      </div>
      <div className='content'>
        {contentViewMode !== 'welcome' ? undefined : (
          <Img alt='logo' src='/logo.svg' width={222} height={172} />
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
    </StyledPaper>
  );
}
