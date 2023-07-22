import {
  selectModel,
  selectModelCount,
  selectModelIndex,
  selectObjectKey,
  selectObjectSelectionType,
  setObjectType,
  useAppDispatch,
  useAppSelector,
  navToPrevModel,
  navToNextModel
} from '@/store';
import {
  Button,
  IconButton,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  styled
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import { useMemo, useEffect, useCallback, useContext } from 'react';
import ViewOptionsContext from '@/contexts/ViewOptionsContext';

import useSupportedFilePicker from '@/hooks/useSupportedFilePicker';
import { useHeldRepetitionTimer, useModelSelectionExport } from '@/hooks';
import useSceneOBJFileDownloader from '@/hooks/useSceneOBJDownloader';
import { mdiMenuLeftOutline, mdiMenuRightOutline } from '@mdi/js';
import Icon from '@mdi/react';
import clsx from 'clsx';
import GuiPanelViewOptions from './GuiPanelViewOptions';
import GuiPanelButton from './GuiPanelButton';
import GuiPanelSection from './GuiPanelSection';
import GuiPanelTextures from './GuiPanelTextures';

const WIDTH = 222;

// @TODO: consider either:
// (1) breaking this panel into separate components,
// (2) offload hook functionality since there's quite a lot of cruft
// (3) abstract the components to eliminate cognitive overhead

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
    }

    &.MuiPaper-root:not(.visible) {
      width: 0;
      opacity: 0;
      pointer-events: none;
    }

    & .content {
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
      padding-bottom: 0;
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

    & *:nth-child(odd) {
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }

    & .property-table *:nth-child(even) {
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

    & > .textures *:not(:last-child) {
      margin-bottom: ${theme.spacing(1)}
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

    & .MuiButton-root.MuiButton-outlined:not(:last-child) {
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
  `
);

export default function GuiPanel() {
  // @TODO use a more standard error dialog vs using window.alert here
  const openFileSelector = useSupportedFilePicker(globalThis.alert);

  const viewOptions = useContext(ViewOptionsContext);
  const dispatch = useAppDispatch();
  const onExportSelectionJson = useModelSelectionExport();
  const onExportOBJFile = useSceneOBJFileDownloader();
  const modelIndex = useAppSelector(selectModelIndex);
  const modelCount = useAppSelector(selectModelCount);
  const objectKey = useAppSelector(selectObjectKey);
  const objectSelectionType = useAppSelector(selectObjectSelectionType);
  const model = useAppSelector(selectModel);
  const onSetObjectSelectionType = useCallback(
    (_: React.MouseEvent<HTMLElement>, type: 'mesh' | 'polygon') => {
      type && dispatch(setObjectType(type));
    },
    [objectSelectionType]
  );

  const exportSelectionButton = useMemo(() => {
    {
      let title = 'Export Model JSON';

      if (objectKey) {
        title = `Export ${
          objectSelectionType === 'mesh' ? 'Mesh' : 'Polygon'
        } JSON`;
      }

      return !model ? undefined : (
        <Tooltip title='Export ModNao .json data. Will narrow data down to the current selection'>
          <Button
            fullWidth
            onClick={onExportSelectionJson}
            color='secondary'
            size='small'
            variant='outlined'
          >
            {title}
          </Button>
        </Tooltip>
      );
    }
  }, [model, objectSelectionType, objectKey, onExportSelectionJson]);

  const [onStartPrevModelNav, onStopPrevModelNav] = useHeldRepetitionTimer();
  const [onStartNextModelNav, onStopNextModelNav] = useHeldRepetitionTimer();

  useEffect(() => {
    window.addEventListener('mouseup', onStopPrevModelNav);
    window.addEventListener('mouseup', onStopNextModelNav);
    return () => {
      window.removeEventListener('mouseup', onStopPrevModelNav);
      window.removeEventListener('mouseup', onStopNextModelNav);
    };
  }, []);

  const onStartModelPrevClick = useCallback(() => {
    onStartPrevModelNav(() => {
      dispatch(navToPrevModel());
    });
  }, [modelIndex]);

  const onStartModelNextClick = useCallback(() => {
    onStartNextModelNav(() => {
      dispatch(navToNextModel());
    });
  }, [modelIndex]);

  let modelIndexAndCount = '--';

  if (model) {
    const sp = modelCount > 99 && modelIndex > 98 ? '' : ' ';
    modelIndexAndCount = `${modelIndex + 1}${sp}/${sp}${modelCount}`;
  }

  return (
    <StyledPaper
      square
      className={clsx(viewOptions.guiPanelVisible && 'visible')}
    >
      <div className='content'>
        <GuiPanelSection title='Models'>
          <div className='selection'>
            <Grid container className='property-table'>
              <Grid xs={4}>
                <Typography variant='body1' textAlign='right'>
                  Models
                </Typography>
              </Grid>
              <Grid xs={8}>
                <IconButton
                  className='model-nav-button'
                  color='primary'
                  aria-haspopup='true'
                  onMouseDown={onStartModelPrevClick}
                  onMouseUp={onStopPrevModelNav}
                  disabled={!model || modelIndex === 0}
                >
                  <Icon path={mdiMenuLeftOutline} size={1} />
                </IconButton>
                <Typography variant='button' textAlign='right'>
                  {modelIndexAndCount}
                </Typography>
                <IconButton
                  className='model-nav-button'
                  color='primary'
                  aria-haspopup='true'
                  onMouseDown={onStartModelNextClick}
                  onMouseUp={onStopNextModelNav}
                  disabled={!model || modelIndex === modelCount - 1}
                >
                  <Icon path={mdiMenuRightOutline} size={1} />
                </IconButton>
              </Grid>
              <Grid xs={8}>
                <Typography variant='body1' textAlign='right'>
                  Object Key
                </Typography>
              </Grid>
              <Grid xs={4}>
                <Typography variant='button' textAlign='right'>
                  {!objectKey ? '--' : objectKey}
                </Typography>
              </Grid>
              <Grid xs={8}>
                <Typography variant='body1' textAlign='right'>
                  Object Type
                </Typography>
              </Grid>
              <Grid xs={4}>
                <ToggleButtonGroup
                  orientation='vertical'
                  color='secondary'
                  value={objectSelectionType}
                  size='small'
                  exclusive
                  onChange={onSetObjectSelectionType}
                  aria-label='text alignment'
                >
                  <ToggleButton value='mesh'>mesh</ToggleButton>
                  <ToggleButton value='polygon'>polygon</ToggleButton>
                </ToggleButtonGroup>
              </Grid>
            </Grid>
            <GuiPanelButton
              tooltip='Select an MVC2 or CVS2 STG POL.BIN and/or TEX.BIN files'
              onClick={openFileSelector}
            >
              Import Model/Texture
            </GuiPanelButton>
            {!model ? undefined : (
              <GuiPanelButton
                tooltip={
                  <div>
                    <p>
                      Export an.obj file representing the selected in-scene
                      model meshes.
                    </p>
                  </div>
                }
                onClick={onExportOBJFile}
                color='secondary'
              >
                Export Model .OBJ
              </GuiPanelButton>
            )}
            {exportSelectionButton}
          </div>
        </GuiPanelSection>
        <GuiPanelTextures />
        <GuiPanelViewOptions />
      </div>
    </StyledPaper>
  );
}
