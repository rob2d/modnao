import Img from 'next/image';
import { Divider, Paper, styled } from '@mui/material';
import { useContext } from 'react';
import ViewOptionsContext from '@/contexts/ViewOptionsContext';
import clsx from 'clsx';
import GuiPanelViewOptions from './GuiPanelViewOptions';
import GuiPanelTextures from './GuiPanelTextures';
import GuiPanelModels from './GuiPanelModels';
import {
  selectHasLoadedPolygonFile,
  selectHasLoadedTextureFile,
  useAppSelector
} from '@/store';

const WIDTH = 222;

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
      width: ${WIDTH}px;
      flex-shrink: 0;
    }

    &.MuiPaper-root:not(.visible) {
      width: 0;
      opacity: 0;
      pointer-events: none;
    }

    & > .content {
      position: absolute;
      top: 0;
      left: 0;
      width: ${WIDTH}px;
      height: 100vh;
      flex-shrink: 0;
      
      display: flex;
      flex-direction: column; 
      align-items: flex-end;
      box-sizing: border-box;
      padding-top: ${theme.spacing(1)};
      padding-bottom: ${theme.spacing(1)};
    }

    & .content .MuiToggleButtonGroup-root:not(:first-item) {
      margin-top: ${theme.spacing(1)};
    }

    & .content .MuiToggleButtonGroup-root {
      margin-bottom: ${theme.spacing(1)};
    }

    & .content .MuiToggleButtonGroup-root .MuiButtonBase-root {
      width: 100%;
      justify-content: center;
    }

    & .content > .MuiTypography-subtitle2, & .content > :not(.MuiDivider-root) {
      width: 100%;
      padding-left: ${theme.spacing(2)};
      padding-right: ${theme.spacing(2)};
    }

    & .content > .selection {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      width: 100%;    
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
      width: 222px;
      flex-grow: 2;
      overflow-y: auto;
      margin-bottom: 0;
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
    & .export-texture-button-container:not(:last-child) {
      margin-bottom: ${theme.spacing(1)};
    }

    & .export-texture-button-container {
      margin-top: ${theme.spacing(1)};
    }

    & .MuiDivider-root:not(:first-child) {
      padding-top: ${theme.spacing(1)};
    }

    & .MuiIconButton-root.model-nav-button {
      width: 28px;
    }

    & .grid-control-label {
      display: flex;
      justify-content: flex-start;
      align-items: center;
    }
  `
);

export default function GuiPanel() {
  const viewOptions = useContext(ViewOptionsContext);
  const hasLoadedTextureFile = useAppSelector(selectHasLoadedTextureFile);
  const hasLoadedPolygonFile = useAppSelector(selectHasLoadedPolygonFile);
  const isTextureOnlyMode = hasLoadedTextureFile && !hasLoadedPolygonFile;

  return (
    <StyledPaper
      square
      className={clsx(viewOptions.guiPanelVisible && 'visible')}
    >
      <div className='content'>
        {!hasLoadedPolygonFile && !hasLoadedTextureFile ? (
          <Img alt='logo' src='/logo.svg' width={222} height={172} />
        ) : undefined}
        {!isTextureOnlyMode ? (
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
