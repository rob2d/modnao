import {
  Box,
  Button,
  Checkbox,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  TextField,
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
  selectModels,
  selectPolygonFileName,
  selectRealModelIndexes,
  selectResourceAttribs,
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
import { downloadPolygonFile } from '@/modules/model-data';
import SceneOptionsContext from '@/contexts/SceneOptionsContext';
import FileImportArea from './FileImportArea';
import GuiPanelActionButtonRow from './GuiPanelActionButtonRow';

const matchesFuzzySearch = (value: string, search: string) => {
  const normalizedValue = value.toLocaleLowerCase();
  const normalizedSearch = search.trim().toLocaleLowerCase();

  if (!normalizedSearch) {
    return true;
  }

  let searchIndex = 0;

  for (const character of normalizedValue) {
    if (character !== normalizedSearch[searchIndex]) {
      continue;
    }

    searchIndex += 1;

    if (searchIndex === normalizedSearch.length) {
      return true;
    }
  }

  return false;
};

export default function GuiPanelModels() {
  const sceneOptions = useContext(SceneOptionsContext);
  const dispatch = useAppDispatch();

  const uiNav = useObjectUINav();
  const selectedObjectIds = useAppSelector(selectSelectedObjectIds);
  const meshSelectionType = useAppSelector(selectMeshSelectionType);
  const polygonFileName = useAppSelector(selectPolygonFileName);
  const modelIndex = useAppSelector(selectModelIndex);
  const modelCount = useAppSelector(selectModelCount);
  const model = useAppSelector(selectModel);
  const models = useAppSelector(selectModels);
  const realModelIndexes = useAppSelector(selectRealModelIndexes);
  const resourceAttribs = useAppSelector(selectResourceAttribs);
  const [gltfExportAnchorEl, setGltfExportAnchorEl] =
    useState<HTMLElement | null>(null);
  const [gltfCustomAnchorEl, setGltfCustomAnchorEl] =
    useState<HTMLElement | null>(null);
  const [customGltfModelIndexes, setCustomGltfModelIndexes] = useState<
    number[]
  >([]);
  const [customGltfModelSearch, setCustomGltfModelSearch] = useState('');
  const [customGltfModelsStaggered, setCustomGltfModelsStaggered] =
    useState(true);

  const currentGltfModelIndexes = useMemo(
    () => (modelIndex < 0 ? [] : [modelIndex]),
    [modelIndex]
  );
  const allGltfModelIndexes = useMemo(
    () => realModelIndexes,
    [realModelIndexes]
  );

  const onExportSelectionJson = useModelSelectionExport();
  const onExportCurrentModelToGLTF = useSceneGLTFFileDownloader({
    modelIndexes: currentGltfModelIndexes,
    staggerModels: false
  });
  const onExportAllModelsToGLTF = useSceneGLTFFileDownloader({
    modelIndexes: allGltfModelIndexes,
    staggerModels: true
  });
  const onExportCustomModelsToGLTF = useSceneGLTFFileDownloader({
    modelIndexes: customGltfModelIndexes,
    staggerModels: customGltfModelsStaggered
  });

  const onOpenGltfExportPopover = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setGltfExportAnchorEl(event.currentTarget);
      sceneOptions.setRenderModelIndexes(undefined);
      setCustomGltfModelIndexes((modelIndexes) => {
        const realModelIndexSet = new Set(realModelIndexes);
        const filteredModelIndexes = modelIndexes.filter((modelIndex) =>
          realModelIndexSet.has(modelIndex)
        );

        if (filteredModelIndexes.length || !realModelIndexSet.has(modelIndex)) {
          return filteredModelIndexes;
        }

        return [modelIndex];
      });
    },
    [modelIndex, realModelIndexes, sceneOptions]
  );

  const onCloseGltfExportPopover = useCallback(() => {
    setGltfExportAnchorEl(null);
    setGltfCustomAnchorEl(null);
    setCustomGltfModelSearch('');
    sceneOptions.setRenderModelIndexes(undefined);
    sceneOptions.setRenderModelsStaggered(true);
  }, [sceneOptions]);

  const onOpenCustomGltfMenu = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setGltfCustomAnchorEl(event.currentTarget);
      sceneOptions.setRenderModelIndexes(
        customGltfModelIndexes.length
          ? customGltfModelIndexes
          : currentGltfModelIndexes
      );
      sceneOptions.setRenderModelsStaggered(customGltfModelsStaggered);
    },
    [
      currentGltfModelIndexes,
      customGltfModelIndexes,
      customGltfModelsStaggered,
      sceneOptions
    ]
  );

  const onCloseCustomGltfMenu = useCallback(() => {
    setGltfCustomAnchorEl(null);
    setCustomGltfModelSearch('');
    sceneOptions.setRenderModelIndexes(undefined);
    sceneOptions.setRenderModelsStaggered(true);
  }, [sceneOptions]);

  const onCustomGltfModelSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setCustomGltfModelSearch(event.target.value);
    },
    []
  );

  const onCustomGltfModelsStaggeredChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setCustomGltfModelsStaggered(event.target.checked);
      sceneOptions.setRenderModelsStaggered(event.target.checked);
    },
    [sceneOptions]
  );

  const onToggleCustomGltfModel = useCallback(
    (optionModelIndex: number) => {
      setCustomGltfModelIndexes((modelIndexes) => {
        const nextModelIndexes = modelIndexes.includes(optionModelIndex)
          ? modelIndexes.filter((index) => index !== optionModelIndex)
          : [...modelIndexes, optionModelIndex];

        sceneOptions.setRenderModelIndexes(nextModelIndexes);

        return nextModelIndexes;
      });
    },
    [sceneOptions]
  );

  const onExportCustomModelsToGLTFClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      setGltfExportAnchorEl(null);
      setGltfCustomAnchorEl(null);
      onExportCustomModelsToGLTF();
    },
    [onExportCustomModelsToGLTF]
  );

  const onExportCurrentModelToGLTFClick = useCallback(() => {
    setGltfExportAnchorEl(null);
    setGltfCustomAnchorEl(null);
    onExportCurrentModelToGLTF();
  }, [onExportCurrentModelToGLTF]);

  const onExportAllModelsToGLTFClick = useCallback(() => {
    setGltfExportAnchorEl(null);
    setGltfCustomAnchorEl(null);
    onExportAllModelsToGLTF();
  }, [onExportAllModelsToGLTF]);

  const onDownloadPolygonFile = useCallback(() => {
    dispatch(downloadPolygonFile());
  }, [dispatch]);

  const onSetMeshSelectionType = useCallback(
    (_: React.MouseEvent<HTMLElement>, type: MeshSelectionType | null) => {
      if (!type) {
        return;
      }

      dispatch(setObjectType(type));
    },
    [dispatch]
  );

  const customGltfModelOptions = useMemo(
    () =>
      realModelIndexes.map((optionModelIndex) => {
        const optionModel = models[optionModelIndex];
        const modelName = resourceAttribs?.polygonMapped
          ? resourceAttribs.modelHints?.[optionModelIndex]?.name
          : undefined;

        return {
          label: modelName ?? `Model ${optionModelIndex + 1}`,
          meshCount: optionModel.meshes.length,
          modelIndex: optionModelIndex
        };
      }),
    [models, realModelIndexes, resourceAttribs]
  );
  const visibleCustomGltfModelOptions = useMemo(() => {
    const selectedOptions = customGltfModelOptions.filter((option) =>
      customGltfModelIndexes.includes(option.modelIndex)
    );
    const matchingOptions = customGltfModelOptions.filter(
      (option) =>
        !customGltfModelIndexes.includes(option.modelIndex) &&
        matchesFuzzySearch(
          `${option.label} ${option.modelIndex + 1}`,
          customGltfModelSearch
        )
    );

    return [...selectedOptions, ...matchingOptions];
  }, [customGltfModelIndexes, customGltfModelOptions, customGltfModelSearch]);
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
        <Grid className='grid-control-label' size={6}>
          <Typography variant='body1' textAlign='right'>
            Selection
          </Typography>
        </Grid>
        <Grid size={6}>
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
            tooltip='Download polygon ROM file with current edits'
            onClick={onDownloadPolygonFile}
            color='secondary'
          >
            EXPORT MODELS
          </GuiPanelButton>
          <GuiPanelButton
            tooltip={
              'Choose a .gltf export for the current model or all viewable models.'
            }
            onClick={onOpenGltfExportPopover}
            color='secondary'
          >
            Export GLTF
          </GuiPanelButton>
          <Menu
            open={Boolean(gltfExportAnchorEl)}
            anchorEl={gltfExportAnchorEl}
            onClose={onCloseGltfExportPopover}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          >
            <MenuItem
              onClick={onExportCurrentModelToGLTFClick}
              onMouseEnter={onCloseCustomGltfMenu}
              sx={{
                minWidth: 200
              }}
            >
              Current Model
            </MenuItem>
            <MenuItem
              onClick={onExportAllModelsToGLTFClick}
              onMouseEnter={onCloseCustomGltfMenu}
            >
              All Models
            </MenuItem>
            <MenuItem
              onClick={onOpenCustomGltfMenu}
              onMouseEnter={onOpenCustomGltfMenu}
              selected={Boolean(gltfCustomAnchorEl)}
              sx={{
                gap: 2,
                justifyContent: 'space-between',
                '&.Mui-selected, &.Mui-selected:hover': {
                  backgroundColor: 'var(--mui-palette-action-hover)'
                }
              }}
            >
              <ListItemText primary='Custom Export' />
              <KeyboardArrowRightIcon fontSize='small' />
            </MenuItem>
          </Menu>
          <Menu
            open={Boolean(gltfCustomAnchorEl)}
            anchorEl={gltfCustomAnchorEl}
            onClose={onCloseCustomGltfMenu}
            anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{
              paper: {
                sx: {
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: 420,
                  mr: 1
                }
              },
              list: {
                sx: {
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  p: 0
                }
              }
            }}
          >
            <Box sx={{ px: 1, py: 0.75, flexShrink: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  color='secondary'
                  disabled={!customGltfModelIndexes.length}
                  onClick={onExportCustomModelsToGLTFClick}
                  size='small'
                  variant='outlined'
                  sx={{ flexGrow: 1 }}
                >
                  EXPORT
                </Button>
                <Box
                  component='label'
                  sx={{
                    alignItems: 'center',
                    cursor: 'pointer',
                    display: 'flex',
                    gap: 0.5,
                    typography: 'caption',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Checkbox
                    checked={customGltfModelsStaggered}
                    onChange={onCustomGltfModelsStaggeredChange}
                    size='small'
                    sx={{ p: 0.25 }}
                  />
                  Stagger?
                </Box>
              </Box>
              <TextField
                fullWidth
                onChange={onCustomGltfModelSearchChange}
                onKeyDown={(event) => event.stopPropagation()}
                placeholder='Filter models'
                size='small'
                value={customGltfModelSearch}
                sx={{ mt: 0.75 }}
              />
            </Box>
            <Divider />
            <Box sx={{ overflowY: 'auto' }}>
              {visibleCustomGltfModelOptions.map((option) => {
                const checked = customGltfModelIndexes.includes(
                  option.modelIndex
                );
                const meshCountLabel = `${option.meshCount} mesh${
                  option.meshCount === 1 ? '' : 'es'
                }`;

                return (
                  <MenuItem
                    key={option.modelIndex}
                    onClick={() => onToggleCustomGltfModel(option.modelIndex)}
                    dense
                    sx={{ minWidth: 240 }}
                  >
                    <ListItemIcon sx={{ minWidth: 34 }}>
                      <Checkbox
                        edge='start'
                        checked={checked}
                        disableRipple
                        readOnly
                        size='small'
                        tabIndex={-1}
                        sx={{ px: 1 }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={option.label}
                      secondary={meshCountLabel}
                      slotProps={{
                        primary: { variant: 'body2' },
                        secondary: { variant: 'caption' }
                      }}
                      sx={{ my: 0 }}
                    />
                  </MenuItem>
                );
              })}
            </Box>
          </Menu>
          {exportSelectionButton}
        </GuiPanelActionButtonRow>
      </Box>
    </GuiPanelSection>
  );
}
