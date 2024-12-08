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
  useSceneGLTFFileDownloader
} from '@/hooks';
import { mdiMenuLeftOutline, mdiMenuRightOutline } from '@mdi/js';
import ViewOptionsContext from '@/contexts/ViewOptionsContext';
import ModelFileImportButton from './ModelFileImportButton';

const StyledButtons = styled('div')(
  () => `
  & {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .panel.expanded & {
    flex-direction: row;
  }

  .panel.expanded & > div:nth-child(2) {
    display: flex;
    flex-direction: column;
  }
`
);

export default function GuiPanelModels() {
  const viewOptions = useContext(ViewOptionsContext);
  const dispatch = useAppDispatch();

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

  const modelNoAndCountEl = (
    <Typography variant='button' textAlign='right'>
      {modelNoAndCount}
    </Typography>
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

  const collapsedContentFABs = viewOptions.guiPanelExpansionLevel
    ? [navButtonLeft, modelNoAndCountEl, navButtonRight]
    : [navButtonLeft, navButtonRight];

  return !polygonFileName ? (
    <ModelFileImportButton />
  ) : (
    <GuiPanelSection
      title='Models'
      subtitle={polygonFileName}
      collapsedContent={<ModelFileImportButton />}
      collapsedContentFABs={collapsedContentFABs}
    >
      <Grid container className='property-table'>
        <Grid xs={4} className='grid-control-label'>
          <Typography variant='body1' textAlign='right'>
            Models
          </Typography>
        </Grid>
        <Grid xs={8}>
          {navButtonLeft}
          {modelNoAndCountEl}
          {navButtonRight}
        </Grid>
        <Grid xs={7} className='grid-control-label'>
          <Typography variant='body1' textAlign='right'>
            {viewOptions.guiPanelExpansionLevel > 1 ? 'Selected ' : ''}
            Object Key
          </Typography>
        </Grid>
        <Grid xs={5}>
          <Typography variant='button' textAlign='right'>
            {!objectKey ? '--' : objectKey}
          </Typography>
        </Grid>
        <Grid xs={7} className='grid-control-label'>
          <Typography variant='body1' textAlign='right'>
            Selection Type
          </Typography>
        </Grid>
        <Grid xs={5}>
          <ToggleButtonGroup
            orientation={
              viewOptions.guiPanelExpansionLevel <= 1
                ? 'vertical'
                : 'horizontal'
            }
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
      <StyledButtons>
        <ModelFileImportButton />
        <div>
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
      </StyledButtons>
    </GuiPanelSection>
  );
}
