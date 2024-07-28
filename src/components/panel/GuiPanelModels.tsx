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
import Grid from '@mui/material/Unstable_Grid2';
import GuiPanelButton from './GuiPanelButton';
import GuiPanelSection from './GuiPanelSection';
import { useCallback, useContext, useMemo } from 'react';
import {
  selectMeshSelectionType,
  selectModel,
  selectModelCount,
  selectModelIndex,
  selectObjectKey,
  selectPolygonFileName,
  setObjectType,
  useAppDispatch,
  useAppSelector
} from '@/store';
import {
  useModelSelectionExport,
  useObjectUINav,
  useSceneGLTFFileDownloader,
  useSupportedFilePicker
} from '@/hooks';
import { mdiMenuLeftOutline, mdiMenuRightOutline } from '@mdi/js';
import ViewOptionsContext from '@/contexts/ViewOptionsContext';
import { showError } from '@/store/errorMessagesSlice';
import FilesSupportedButton from '../FilesSupportedButton';

const Styled = styled('div')(
  ({ theme }) => `& {
  .supported-files {
    width: 100%;
    font-size: 8pt;
    margin-top: -${theme.spacing(2)};
  }`
);

export default function GuiPanelModels() {
  const viewOptions = useContext(ViewOptionsContext);
  const dispatch = useAppDispatch();
  const onHandleError = useCallback((message: string | JSX.Element) => {
    dispatch(showError({ title: 'Invalid file selection', message }));
  }, []);

  const openFileSelector = useSupportedFilePicker(onHandleError);
  const uiNav = useObjectUINav();
  const objectKey = useAppSelector(selectObjectKey);
  const meshSelectionType = useAppSelector(selectMeshSelectionType);
  const onExportToGLTF = useSceneGLTFFileDownloader(false);
  const onExportAllToGLTF = useSceneGLTFFileDownloader(true);

  const onExportSelectionJson = useModelSelectionExport();
  const onSetMeshSelectionType = useCallback(
    (_: React.MouseEvent<HTMLElement>, type: 'mesh' | 'polygon') => {
      type && dispatch(setObjectType(type));
    },
    [meshSelectionType]
  );

  const polygonFileName = useAppSelector(selectPolygonFileName);
  const modelIndex = useAppSelector(selectModelIndex);
  const modelCount = useAppSelector(selectModelCount);
  const model = useAppSelector(selectModel);

  const exportSelectionButton = useMemo(() => {
    if (!viewOptions.devOptionsVisible) {
      return undefined;
    }

    let title = 'Export Model JSON';

    if (objectKey) {
      title = `Export ${
        meshSelectionType === 'mesh' ? 'Mesh' : 'Polygon'
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
  }, [
    model,
    meshSelectionType,
    objectKey,
    onExportSelectionJson,
    viewOptions.devOptionsVisible
  ]);

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
      <FilesSupportedButton className={'supported-files'} />
    </Styled>
  );

  const navButtonLeft = (
    <Tooltip title={<>View previous model (⌨&nbsp;Left)</>}>
      <IconButton
        className='model-nav-button'
        color='primary'
        {...uiNav.prevButtonProps}
        disabled={!model || uiNav.prevButtonProps.disabled}
      >
        <Icon path={mdiMenuLeftOutline} size={1} />
      </IconButton>
    </Tooltip>
  );

  const navButtonRight = (
    <Tooltip title={<>View next model(⌨&nbsp;Right)</>}>
      <IconButton
        className='model-nav-button'
        color='primary'
        {...uiNav.nextButtonProps}
        disabled={!model || uiNav.nextButtonProps.disabled}
      >
        <Icon path={mdiMenuRightOutline} size={1} />
      </IconButton>
    </Tooltip>
  );

  return !polygonFileName ? (
    <div className='selection'>{importFiles}</div>
  ) : (
    <GuiPanelSection
      title='Models'
      subtitle={polygonFileName}
      collapsedContent={importFiles}
      collapsedContentFABs={[navButtonLeft, navButtonRight]}
    >
      <div className='selection'>
        <Grid container className='property-table'>
          <Grid xs={4} className='grid-control-label'>
            <Typography variant='body1' textAlign='right'>
              Models
            </Typography>
          </Grid>
          <Grid xs={8}>
            {navButtonLeft}
            <Typography variant='button' textAlign='right'>
              {modelNoAndCount}
            </Typography>
            {navButtonRight}
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
              value={meshSelectionType}
              size='small'
              exclusive
              onChange={onSetMeshSelectionType}
              aria-label='text alignment'
            >
              <ToggleButton value='mesh'>mesh</ToggleButton>
              <ToggleButton value='polygon'>polygon</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
        {importFiles}
        <GuiPanelButton
          tooltip={
            'Export a .gltf file representing the currently viewed in-scene model ' +
            'meshes and textures to import into Maya or Blender.'
          }
          onClick={onExportToGLTF}
          color='secondary'
        >
          Export Scene .GLTF
        </GuiPanelButton>
        <GuiPanelButton
          tooltip={
            'Export a .gltf file representing *all* viewable model' +
            'meshes and textures to import into Maya or Blender.'
          }
          onClick={onExportAllToGLTF}
          color='secondary'
        >
          Export Models .GLTF
        </GuiPanelButton>
        {exportSelectionButton}
      </div>
    </GuiPanelSection>
  );
}
