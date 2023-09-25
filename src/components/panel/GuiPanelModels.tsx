import {
  Button,
  IconButton,
  styled,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography
} from '@mui/material';
import Icon from '@mdi/react';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import GuiPanelButton from './GuiPanelButton';
import GuiPanelSection from './GuiPanelSection';
import { useCallback, useContext, useEffect, useMemo } from 'react';
import {
  navToNextModel,
  navToPrevModel,
  selectModel,
  selectModelCount,
  selectModelIndex,
  selectObjectKey,
  selectObjectSelectionType,
  selectPolygonFileName,
  setObjectType,
  showDialog,
  useAppDispatch,
  useAppSelector
} from '@/store';
import { useHeldRepetitionTimer, useModelSelectionExport } from '@/hooks';
import useSceneOBJFileDownloader from '@/hooks/useSceneOBJDownloader';
import useSupportedFilePicker from '@/hooks/useSupportedFilePicker';
import { mdiMenuLeftOutline, mdiMenuRightOutline } from '@mdi/js';
import ViewOptionsContext from '@/contexts/ViewOptionsContext';

const Styled = styled('div')(
  ({ theme }) => `& {
  .supported-files {
    width: 100%;
    font-size: 8pt;
    margin-top: -${theme.spacing(1)};
  }`
);

export default function GuiPanelModels() {
  const viewOptions = useContext(ViewOptionsContext);
  const dispatch = useAppDispatch();
  // @TODO use a more standard error dialog vs using window.alert here
  const openFileSelector = useSupportedFilePicker(globalThis.alert);

  const objectKey = useAppSelector(selectObjectKey);
  const objectSelectionType = useAppSelector(selectObjectSelectionType);
  const onExportOBJFile = useSceneOBJFileDownloader();
  const onExportSelectionJson = useModelSelectionExport();
  const onSetObjectSelectionType = useCallback(
    (_: React.MouseEvent<HTMLElement>, type: 'mesh' | 'polygon') => {
      type && dispatch(setObjectType(type));
    },
    [objectSelectionType]
  );

  const polygonFileName = useAppSelector(selectPolygonFileName);
  const modelIndex = useAppSelector(selectModelIndex);
  const modelCount = useAppSelector(selectModelCount);
  const model = useAppSelector(selectModel);

  const exportSelectionButton = useMemo(() => {
    {
      if (!viewOptions.devOptionsVisible) {
        return undefined;
      }

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
  }, [
    model,
    objectSelectionType,
    objectKey,
    onExportSelectionJson,
    viewOptions.devOptionsVisible
  ]);

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

  let modelNoAndCount = '--';

  if (model) {
    const sp = modelCount > 99 && modelIndex > 98 ? '' : ' ';
    modelNoAndCount = `${modelIndex + 1}${sp}/${sp}${modelCount}`;
  }

  const importFiles = (
    <Styled className='import-files'>
      <GuiPanelButton
        tooltip='Select an MVC2 or CVS2 STG POL.BIN and/or TEX.BIN files'
        onClick={openFileSelector}
      >
        Import Model/Texture
      </GuiPanelButton>
      <Button
        onClick={() => {
          dispatch(showDialog('file-support-info'));
        }}
        color='secondary'
        size='small'
        variant='text'
        className='supported-files'
      >
        What Files Are Supported?
      </Button>
    </Styled>
  );

  return !polygonFileName ? (
    <div className='selection'>{importFiles}</div>
  ) : (
    <GuiPanelSection title='Models' subtitle={polygonFileName}>
      <div className='selection'>
        <Grid container className='property-table'>
          <Grid xs={4} className='grid-control-label'>
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
              {modelNoAndCount}
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
          <Grid xs={8} className='grid-control-label'>
            <Typography variant='body1' textAlign='right'>
              Object Key
            </Typography>
          </Grid>
          <Grid xs={4}>
            <Typography variant='button' textAlign='right'>
              {!objectKey ? '--' : objectKey}
            </Typography>
          </Grid>
          <Grid xs={8} className='grid-control-label'>
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
        {importFiles}
        {!viewOptions.devOptionsVisible ? undefined : (
          <GuiPanelButton
            tooltip={
              <div>
                <p>
                  Export an.obj file representing the selected in-scene model
                  meshes.
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
  );
}
