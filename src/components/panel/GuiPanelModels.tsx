import {
  Box,
  Button,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography
} from '@mui/material';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import Grid from '@mui/material/Grid';
import GuiPanelButton from './GuiPanelButton';
import GuiPanelSection from './GuiPanelSection';
import { useCallback, useContext, useMemo } from 'react';
import {
  selectMeshSelectionType,
  selectModel,
  selectModelCount,
  selectModelIndex,
  selectObjectKey,
  selectPolygonFileName
} from '@/selectors';
import { setObjectType } from '@/modules/object-viewer';
import { useAppDispatch, useAppSelector } from '@/storeTypings';
import {
  useModelSelectionExport,
  useObjectUINav,
  useSceneGLTFFileDownloader
} from '@/modules/object-viewer';
import SceneOptionsContext from '@/contexts/SceneOptionsContext';
import ModelFileImportButton from './ModelFileImportButton';

export default function GuiPanelModels() {
  const sceneOptions = useContext(SceneOptionsContext);
  const dispatch = useAppDispatch();

  const uiNav = useObjectUINav();
  const objectKey = useAppSelector(selectObjectKey);
  const meshSelectionType = useAppSelector(selectMeshSelectionType);
  const onExportToGLTF = useSceneGLTFFileDownloader(false);
  const onExportAllToGLTF = useSceneGLTFFileDownloader(true);

  const onExportSelectionJson = useModelSelectionExport();
  const onSetMeshSelectionType = useCallback(
    (_: React.MouseEvent<HTMLElement>, type: 'mesh' | 'polygon') => {
      dispatch(setObjectType(type));
    },
    [meshSelectionType]
  );

  const polygonFileName = useAppSelector(selectPolygonFileName);
  const modelIndex = useAppSelector(selectModelIndex);
  const modelCount = useAppSelector(selectModelCount);
  const model = useAppSelector(selectModel);

  const exportSelectionButton = useMemo(() => {
    if (!sceneOptions.devOptionsVisible) {
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
    sceneOptions.devOptionsVisible
  ]);

  let modelNoAndCount = '--';

  if (model) {
    const sp = modelCount > 99 && modelIndex > 98 ? '' : ' ';
    modelNoAndCount = `${modelIndex + 1}${sp}/${sp}${modelCount}`;
  }

  const modelNoAndCountEl = (
    <Typography
      variant='button'
      textAlign='right'
      noWrap
      textOverflow={'ellipsis'}
    >
      {modelNoAndCount}
    </Typography>
  );

  const navButtonLeftDisabled = !model || uiNav.prevButtonProps.disabled;
  const navButtonLeftContent = (
    <IconButton
      className='model-nav-button'
      color='primary'
      {...uiNav.prevButtonProps}
      disabled={navButtonLeftDisabled}
    >
      <KeyboardArrowLeftIcon fontSize='small' />
    </IconButton>
  );

  const navButtonLeft = navButtonLeftDisabled ? (
    navButtonLeftContent
  ) : (
    <Tooltip title={<>View previous model (⌨&nbsp;Left)</>}>
      {navButtonLeftContent}
    </Tooltip>
  );

  const navButtonRightDisabled = !model || uiNav.nextButtonProps.disabled;
  const navButtonRightContent = (
    <IconButton
      className='model-nav-button'
      color='primary'
      {...uiNav.nextButtonProps}
      disabled={navButtonRightDisabled}
    >
      <KeyboardArrowRightIcon fontSize='small' />
    </IconButton>
  );

  const navButtonRight = navButtonRightDisabled ? (
    navButtonRightContent
  ) : (
    <Tooltip title={<>View next model(⌨&nbsp;Right)</>}>
      {navButtonRightContent}
    </Tooltip>
  );

  const collapsedContentFABs =
    sceneOptions.guiPanelExpansionLevel > 1
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
        <Grid className='grid-control-label' size={4}>
          <Typography variant='body1' textAlign='right'>
            Models
          </Typography>
        </Grid>
        <Grid size={8}>
          {navButtonLeft}
          {modelNoAndCountEl}
          {navButtonRight}
        </Grid>
        <Grid className='grid-control-label' size={7}>
          <Typography variant='body1' textAlign='right'>
            {sceneOptions.guiPanelExpansionLevel > 1 ? 'Selected ' : ''}
            Object Key
          </Typography>
        </Grid>
        <Grid size={5}>
          <Typography variant='button' textAlign='right'>
            {!objectKey ? '--' : objectKey}
          </Typography>
        </Grid>
        <Grid className='grid-control-label' size={7}>
          <Typography variant='body1' textAlign='right'>
            Selection Type
          </Typography>
        </Grid>
        <Grid size={5}>
          <ToggleButtonGroup
            orientation={
              sceneOptions.guiPanelExpansionLevel <= 1
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
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          '.panel.expanded &': {
            flexDirection: 'row'
          },
          '.panel.expanded & > div:nth-child(2)': {
            display: 'flex',
            flexDirection: 'column'
          },
          '& .poly-export-buttons': {
            mb: 1
          }
        }}
      >
        <ModelFileImportButton />
        <div className='poly-export-buttons'>
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
              'Export a .gltf file representing *all* viewable model ' +
              'meshes and textures to import into Maya or Blender.'
            }
            onClick={onExportAllToGLTF}
            color='secondary'
          >
            Export Models .GLTF
          </GuiPanelButton>
          {exportSelectionButton}
        </div>
      </Box>
    </GuiPanelSection>
  );
}
