import {
  Box,
  Button,
  IconButton,
  Popover,
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
import { useCallback, useContext, useMemo, useState } from 'react';
import {
  selectMeshSelectionType,
  selectModel,
  selectModelCount,
  selectModelIndex,
  selectPolygonFileName,
  selectSelectedObjectIds
} from '@/selectors';
import { setObjectType } from '@/modules/object-viewer';
import type { MeshSelectionType } from '@/modules/object-viewer';
import { useAppDispatch, useAppSelector } from '@/storeTypings';
import {
  useModelSelectionExport,
  useObjectUINav,
  useSceneGLTFFileDownloader
} from '@/modules/object-viewer';
import SceneOptionsContext from '@/contexts/SceneOptionsContext';
import FileImportArea from './FileImportArea';
import GuiPanelActionButtonRow from './GuiPanelActionButtonRow';

export default function GuiPanelModels() {
  const sceneOptions = useContext(SceneOptionsContext);
  const dispatch = useAppDispatch();

  const uiNav = useObjectUINav();
  const selectedObjectIds = useAppSelector(selectSelectedObjectIds);
  const meshSelectionType = useAppSelector(selectMeshSelectionType);
  const [gltfExportAnchorEl, setGltfExportAnchorEl] =
    useState<HTMLButtonElement | null>(null);

  const onExportSelectionJson = useModelSelectionExport();
  const onExportCurrentModelToGLTF = useSceneGLTFFileDownloader(false);
  const onExportAllModelsToGLTF = useSceneGLTFFileDownloader(true);

  const onOpenGltfExportPopover = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setGltfExportAnchorEl(event.currentTarget);
    },
    []
  );

  const onCloseGltfExportPopover = useCallback(() => {
    setGltfExportAnchorEl(null);
  }, []);

  const onExportCurrentModelToGLTFClick = useCallback(() => {
    setGltfExportAnchorEl(null);
    onExportCurrentModelToGLTF();
  }, [onExportCurrentModelToGLTF]);

  const onExportAllModelsToGLTFClick = useCallback(() => {
    setGltfExportAnchorEl(null);
    onExportAllModelsToGLTF();
  }, [onExportAllModelsToGLTF]);

  const onSetMeshSelectionType = useCallback(
    (_: React.MouseEvent<HTMLElement>, type: MeshSelectionType | null) => {
      if (!type) {
        return;
      }

      dispatch(setObjectType(type));
    },
    [dispatch]
  );

  const polygonFileName = useAppSelector(selectPolygonFileName);
  const modelIndex = useAppSelector(selectModelIndex);
  const modelCount = useAppSelector(selectModelCount);
  const model = useAppSelector(selectModel);
  const selectedObjectKeys = useMemo(
    () =>
      Object.keys(selectedObjectIds).filter(
        (objectKey) => selectedObjectIds[objectKey]
      ),
    [selectedObjectIds]
  );
  const selectedObjectCount = selectedObjectKeys.length;
  let selectionSummary = '--';

  if (selectedObjectCount === 1) {
    selectionSummary = selectedObjectKeys[0];
  } else if (selectedObjectCount > 1) {
    selectionSummary = `${selectedObjectCount} selected`;
  }

  const exportSelectionButton = useMemo(() => {
    if (!sceneOptions.devOptionsVisible) {
      return undefined;
    }

    let title = 'Export Model JSON';

    if (selectedObjectCount > 0) {
      const exportTypeLabels: Record<MeshSelectionType, string> = {
        mesh: 'Mesh',
        polygon: 'Polygon',
        vertex: 'Vertex'
      };

      title = `Export ${exportTypeLabels[meshSelectionType]} JSON`;
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
    selectedObjectCount,
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
      size='small'
      {...uiNav.prevButtonProps}
      disabled={navButtonLeftDisabled}
      sx={{ my: -1 }}
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
      size='small'
      {...uiNav.nextButtonProps}
      disabled={navButtonRightDisabled}
      sx={{ my: -1 }}
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
    <FileImportArea />
  ) : (
    <GuiPanelSection
      title='Models'
      subtitle={polygonFileName}
      collapsedContent={<FileImportArea />}
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
            Selection
          </Typography>
        </Grid>
        <Grid size={5}>
          <Typography
            variant='button'
            textAlign='right'
            sx={{ textTransform: 'none' }}
          >
            {selectionSummary}
          </Typography>
        </Grid>
        <Grid className='grid-control-label' size={7}>
          <Typography variant='body1' textAlign='right'>
            Selection Type
          </Typography>
        </Grid>
        <Grid size={5}>
          <ToggleButtonGroup
            exclusive
            orientation={
              sceneOptions.guiPanelExpansionLevel < 2
                ? 'vertical'
                : 'horizontal'
            }
            color='secondary'
            value={meshSelectionType}
            size='small'
            onChange={onSetMeshSelectionType}
            aria-label='Object selection mode'
            sx={{ mb: 0.5 }}
          >
            <ToggleButton value='mesh'>mesh</ToggleButton>
            <ToggleButton value='polygon'>polygon</ToggleButton>
            <ToggleButton value='vertex'>vertex</ToggleButton>
          </ToggleButtonGroup>
        </Grid>
      </Grid>
      <FileImportArea />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          columnGap: 1
        }}
      >
        <GuiPanelActionButtonRow>
          <GuiPanelButton
            tooltip={
              'Choose a .gltf export for the current model or all viewable models.'
            }
            onClick={onOpenGltfExportPopover}
            color='secondary'
          >
            Export GLTF
          </GuiPanelButton>
          <Popover
            open={Boolean(gltfExportAnchorEl)}
            anchorEl={gltfExportAnchorEl}
            onClose={onCloseGltfExportPopover}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                p: 1,
                minWidth: 200
              }}
            >
              <Button
                fullWidth
                color='secondary'
                onClick={onExportCurrentModelToGLTFClick}
                size='small'
                variant='outlined'
              >
                Current Model
              </Button>
              <Button
                fullWidth
                color='secondary'
                onClick={onExportAllModelsToGLTFClick}
                size='small'
                variant='outlined'
              >
                All Models
              </Button>
            </Box>
          </Popover>
          {exportSelectionButton}
        </GuiPanelActionButtonRow>
      </Box>
    </GuiPanelSection>
  );
}
