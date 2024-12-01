import Img from 'next/image';
import Icon from '@mdi/react';
import { Divider, Paper, styled } from '@mui/material';
import { RefObject, useContext, useEffect, useRef } from 'react';
import clsx from 'clsx';
import ViewOptionsContext, { ViewOptions } from '@/contexts/ViewOptionsContext';
import GuiPanelViewOptions from './GuiPanelViewOptions';
import GuiPanelTextures from './GuiPanelTextures';
import GuiPanelModels from './GuiPanelModels';
import {
  selectContentViewMode,
  selectHasLoadedPolygonFile,
  selectHasLoadedTextureFile,
  useAppSelector
} from '@/store';
import { mdiArrowExpandLeft, mdiArrowExpandRight } from '@mdi/js';
import { useDragMouseOnEl } from '@/hooks';

const PANEL_WIDTHS = [222, 388, 222 + 174 * 2 + 22];

const TRANSITION_TIME = `0.32s`;

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

    &.MuiPaper-root.visible {
      width: ${PANEL_WIDTHS[0]}px;
      flex-shrink: 0;
    }

    &.MuiPaper-root.visible.expanded-1 {
      width: ${PANEL_WIDTHS[1]}px;
    }

    &.MuiPaper-root.visible.expanded-2 {
      width: ${PANEL_WIDTHS[2]}px;
    }

    &.MuiPaper-root:not(.visible) {
      width: 0;
      opacity: 0;
      pointer-events: none;
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
      padding-top: ${theme.spacing(1)};
      padding-bottom: ${theme.spacing(1)};
    }

    & > .content {
      width: 100%;
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

    & .content > .MuiDivider-root {
      margin-bottom: ${theme.spacing(1)};
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

    ${
      !process.env.JEST_WORKER_ID
        ? `& .MuiDivider-root:not(:first-child):not(.export-texture-button-container + .MuiDivider-root):not(.export-texture-images + .MuiDivider-root) {
          padding-top: ${theme.spacing(1)};
        }`
        : ''
    }
    

    & .MuiIconButton-root.model-nav-button {
      width: 28px;
    }

    & .grid-control-label {
      display: flex;
      justify-content: flex-start;
      align-items: center;
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
      transition: background ${TRANSITION_TIME} ease;

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

const usePanelDragState = (
  viewOptions: ViewOptions
): [number, boolean, RefObject<HTMLElement>] => {
  const resizeHandle = useRef<HTMLElement>(null);
  const [dragMouseXY, isMouseDown] = useDragMouseOnEl(resizeHandle);

  useEffect(() => {
    if (isMouseDown) {
      if (!viewOptions.guiPanelExpansionLevel && dragMouseXY.x < -32) {
        viewOptions.setGuiPanelExpansionLevel(1);
      }

      if (viewOptions.guiPanelExpansionLevel && dragMouseXY.x > 32) {
        viewOptions.setGuiPanelExpansionLevel(0);
      }
    }
  }, [isMouseDown && dragMouseXY]);

  return [viewOptions.guiPanelExpansionLevel, isMouseDown, resizeHandle];
};

export default function GuiPanel() {
  const viewOptions = useContext(ViewOptionsContext);
  const contentViewMode = useAppSelector(selectContentViewMode);
  const hasLoadedTextureFile = useAppSelector(selectHasLoadedTextureFile);
  const hasLoadedPolygonFile = useAppSelector(selectHasLoadedPolygonFile);
  const [expansionLevel, resizeMouseDown, resizeHandle] =
    usePanelDragState(viewOptions);

  return (
    <StyledPaper
      square
      className={clsx(
        'panel',
        contentViewMode,
        viewOptions.guiPanelVisible && 'visible',
        expansionLevel && 'expanded',
        expansionLevel && 'expanded-1'
      )}
    >
      <div
        className={clsx('resize-handle', resizeMouseDown && 'active')}
        ref={resizeHandle}
      >
        <Icon
          path={expansionLevel === 1 ? mdiArrowExpandRight : mdiArrowExpandLeft}
          size={0.5}
        />
      </div>
      <div className='content'>
        {contentViewMode !== 'welcome' ? undefined : (
          <Img alt='logo' src='/logo.svg' width={222} height={172} />
        )}
        {contentViewMode !== 'textures' ? (
          <>
            <GuiPanelModels />
            {!hasLoadedTextureFile ? undefined : (
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
