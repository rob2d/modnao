import {
  downloadTextureFile,
  selectHasLoadedTextureFile,
  selectHasReplacementTextures,
  selectModel,
  selectModelCount,
  selectModelIndex,
  selectObjectKey,
  selectObjectMeshIndex,
  selectObjectSelectionType,
  selectTextureDefs,
  setObjectType,
  useAppDispatch,
  useAppSelector
} from '@/store';
import {
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Paper,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  styled
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import {
  useMemo,
  useEffect,
  useCallback,
  useContext,
  SyntheticEvent
} from 'react';
import ViewOptionsContext, {
  MeshDisplayMode
} from '@/contexts/ViewOptionsContext';

import useSupportedFilePicker from '@/hooks/useSupportedFilePicker';
import { useModelSelectionExport } from '@/hooks';
import GuiPanelTexture from './GuiPanelTexture';
import useSceneOBJFileDownloader from '@/hooks/useSceneOBJDownloader';
import { mdiAxisArrow, mdiCursorDefaultOutline } from '@mdi/js';
import Icon from '@mdi/react';

const WIDTH = 222;

// @TODO: consider either:
// (1) breaking this panel into separate components,
// (2) offload hook functionality since there's quite a lot of cruft
// (3) abstract the components to eliminate cognitive overhead

const StyledPaper = styled(Paper)(
  ({ theme }) => `
    &.MuiPaper-root {
        flex-shrink: 0;
        width: ${WIDTH}px;
        height: 100vh;
        top: 0;
        right: 0;
        display: flex;
        flex-direction: column; 
        align-items: flex-end;
        max-height: 100vh;
        box-sizing: border-box;
        padding-top: ${theme.spacing(1)};
        padding-bottom: 0;
    }

    &.MuiPaper-root .MuiToggleButtonGroup-root:not(:first-item) {
      margin-top: ${theme.spacing(1)};
    }

    &.MuiPaper-root .MuiToggleButtonGroup-root {
      margin-bottom: ${theme.spacing(1)};
    }

    &.MuiPaper-root .MuiToggleButtonGroup-root .MuiButtonBase-root {
      width: 100%;
      justify-content: center;
    }

    &.MuiPaper-root > .MuiTypography-subtitle2, &.MuiPaper-root > :not(.MuiDivider-root) {
      width: 100%;
      padding-left: ${theme.spacing(2)};
      padding-right: ${theme.spacing(2)};
    }

    &.MuiPaper-root > .selection {
      display: flex;
      flex-direction: column;
      align-items: end;
      width: 100%;    
    }

    & *:nth-child(odd) {
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }

    & .property-table > *:nth-child(even) {
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

    &.MuiPaper-root > .MuiDivider-root {
      margin-bottom: ${theme.spacing(1)};
    }

    & > .textures *:not(:last-child) {
      margin-bottom: ${theme.spacing(1)}
    }

    & .view-options {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }

    & .MuiButton-root.MuiButton-outlined {
      justify-content: center;
    }

    & .MuiButton-root.MuiButton-outlined:not(:last-child) {
      margin-bottom: ${theme.spacing(1)};
    }

    & .MuiDivider-root:not(:first-child) {
      padding-top: ${theme.spacing(1)};
    }

    & .MuiSlider-root {
      width: calc(100% - 116px);
      margin-left: ${theme.spacing(2)};
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
  const onExportTextureFile = useCallback(() => {
    dispatch(downloadTextureFile());
  }, [dispatch]);
  const modelIndex = useAppSelector(selectModelIndex);
  const modelCount = useAppSelector(selectModelCount);
  const objectKey = useAppSelector(selectObjectKey);
  const meshIndex = useAppSelector(selectObjectMeshIndex);
  const objectSelectionType = useAppSelector(selectObjectSelectionType);
  const model = useAppSelector(selectModel);
  const textureDefs = useAppSelector(selectTextureDefs);
  const hasLoadedTextureFile = useAppSelector(selectHasLoadedTextureFile);

  const selectedMeshTexture: number = useMemo(() => {
    const textureIndex = model?.meshes?.[meshIndex]?.textureIndex;

    return typeof textureIndex === 'number' ? textureIndex : -1;
  }, [model, objectKey, meshIndex]);

  const onSetObjectSelectionType = useCallback(
    (_: React.MouseEvent<HTMLElement>, type: 'mesh' | 'polygon') => {
      type && dispatch(setObjectType(type));
    },
    [objectSelectionType]
  );

  const onSetMeshDisplayMode = useCallback(
    (_: React.MouseEvent<HTMLElement>, mode: MeshDisplayMode) => {
      mode && viewOptions.setMeshDisplayMode(mode);
    },
    [viewOptions.setMeshDisplayMode]
  );

  const onSetAxesHelperVisible = useCallback(
    (_: SyntheticEvent<Element, Event>, value: boolean) => {
      viewOptions.setAxesHelperVisible(value);
    },
    [viewOptions.setAxesHelperVisible]
  );

  const onSetObjectAddressesVisible = useCallback(
    (_: SyntheticEvent<Element, Event>, value: boolean) => {
      viewOptions.setObjectAddressesVisible(value);
    },
    [viewOptions.setObjectAddressesVisible]
  );

  const onSetSceneCursorVisible = useCallback(
    (_: SyntheticEvent<Element, Event>, value: boolean) => {
      viewOptions.setSceneCursorVisible(value);
    },
    [viewOptions.setSceneCursorVisible]
  );

  const textures = useMemo(() => {
    const images: JSX.Element[] = [];
    const textureSet = new Set<number>();

    (model?.meshes || []).forEach((m, i) => {
      if (!textureSet.has(m.textureIndex) && textureDefs?.[m.textureIndex]) {
        textureSet.add(m.textureIndex);
        const textureDef = textureDefs?.[m.textureIndex];

        images.push(
          <GuiPanelTexture
            key={`${m.textureIndex}_${i}`}
            textureDef={textureDef}
            textureIndex={m.textureIndex}
            textureSize={m.textureSize}
            isDeemphasized={
              !(
                selectedMeshTexture === -1 ||
                selectedMeshTexture === m.textureIndex
              )
            }
          />
        );
      }
    });

    return images;
  }, [model, textureDefs, selectedMeshTexture]);

  const hasReplacementTextures = useAppSelector(selectHasReplacementTextures);

  // when selecting a texture, scroll to the item
  useEffect(() => {
    const textureEl = document.getElementById(
      `debug-panel-t-${selectedMeshTexture}`
    );

    if (textureEl) {
      textureEl.scrollIntoView({ behavior: 'smooth' });
    }
  }, [textureDefs && selectedMeshTexture]);

  return (
    <StyledPaper square>
      <Divider flexItem>
        <Typography variant='subtitle2' textAlign='left' width='100%'>
          Models
        </Typography>
      </Divider>
      <div className='selection'>
        <Grid container className={'property-table'}>
          <Grid xs={8}>
            <Typography variant='body1' textAlign='right'>
              Models
            </Typography>
          </Grid>
          <Grid xs={4}>
            <Typography variant='button' textAlign='right'>
              {!model ? '--' : `${modelIndex + 1} / ${modelCount}`}
            </Typography>
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
        <Tooltip title='Select an MVC2 or CVS2 STG POL.BIN and/or TEX.BIN files'>
          <Button
            onClick={openFileSelector}
            color='primary'
            fullWidth
            size='small'
            variant='outlined'
          >
            Import Stage/Texture
          </Button>
        </Tooltip>
        {!model ? undefined : (
          <Tooltip
            title={
              <div>
                <p>
                  Export an.obj file representing the selected in-scene model
                  meshes.
                </p>
              </div>
            }
          >
            <Button
              onClick={onExportOBJFile}
              color='secondary'
              fullWidth
              size='small'
              variant='outlined'
            >
              Export Model .OBJ
            </Button>
          </Tooltip>
        )}
        {!model ? undefined : (
          // @TODO: customize the title and label based on selection-scope
          <Tooltip title='Export ModNao model .json data. Will narrow data down to the current selection'>
            <Button
              fullWidth
              onClick={onExportSelectionJson}
              color='secondary'
              size='small'
              variant='outlined'
            >
              Export Selection JSON
            </Button>
          </Tooltip>
        )}
      </div>
      <Divider flexItem>
        <Typography variant='subtitle2' textAlign='left' width='100%'>
          View
        </Typography>
      </Divider>
      <div className='view-options'>
        <Grid container className={'property-table'}>
          <Grid xs={6}>
            <Typography variant='body1' textAlign='right'>
              Mesh Display
            </Typography>
          </Grid>
          <Grid xs={6}>
            <ToggleButtonGroup
              orientation='vertical'
              size='small'
              color='secondary'
              value={viewOptions.meshDisplayMode}
              exclusive
              onChange={onSetMeshDisplayMode}
              aria-label='Mesh Display Mode Selection'
            >
              <ToggleButton value='wireframe'>wireframe</ToggleButton>
              <ToggleButton value='textured'>textured</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
        {viewOptions.meshDisplayMode !== 'wireframe' ? undefined : (
          <FormControlLabel
            control={<Checkbox checked={viewOptions.objectAddressesVisible} />}
            label='Object Address'
            labelPlacement='start'
            onChange={onSetObjectAddressesVisible}
          />
        )}
        {viewOptions.meshDisplayMode !== 'wireframe' ? undefined : (
          <FormControlLabel
            control={
              <Slider
                size='small'
                min={1}
                max={10}
                defaultValue={3}
                aria-label='Small'
                valueLabelDisplay='auto'
              />
            }
            label='Line Width'
            labelPlacement='start'
            onChange={onSetObjectAddressesVisible}
          />
        )}
        <div className='settings-row'>
          <FormControlLabel
            control={<Checkbox checked={viewOptions.axesHelperVisible} />}
            label={<Icon path={mdiAxisArrow} size={1} />}
            labelPlacement='start'
            onChange={onSetAxesHelperVisible}
          />
          <FormControlLabel
            control={<Checkbox checked={viewOptions.sceneCursorVisible} />}
            label={<Icon path={mdiCursorDefaultOutline} size={1} />}
            labelPlacement='start'
            onChange={onSetSceneCursorVisible}
          />
        </div>
      </div>
      {!hasLoadedTextureFile ? undefined : (
        <>
          <Divider flexItem>
            <Typography variant='subtitle2' textAlign='left' width='100%'>
              Textures
            </Typography>
          </Divider>
          <div className='textures'>{textures}</div>
        </>
      )}
      {!hasReplacementTextures ? undefined : (
        <div>
          <Tooltip title='Download texture ROM binary with replaced images'>
            <Button
              onClick={onExportTextureFile}
              fullWidth
              color='secondary'
              size='small'
              variant='outlined'
            >
              Export Textures
            </Button>
          </Tooltip>
        </div>
      )}
    </StyledPaper>
  );
}
