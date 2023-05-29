import {
  downloadStageTextureFile,
  selectHasLoadedStageTextureFile,
  selectHasReplacementTextures,
  selectModel,
  selectModelCount,
  selectModelIndex,
  selectObjectIndex,
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
  Drawer,
  FormControlLabel,
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

import useStageFilePicker from '@/hooks/useStageFilePicker';
import { useModelSelectionExport } from '@/hooks';
import GuiPanelTexture from './GuiPanelTexture';
import useSceneOBJFileDownloader from '@/hooks/useSceneOBJDownloader';

// @TODO: consider either:
// (1) breaking this panel into separate components,
// (2) offload hook functionality since there's quite a lot of cruft
// (3) abstract the components to eliminate cognitive overhead

const StyledDrawer = styled(Drawer)(
  ({ theme }) => `
    & > .MuiPaper-root:before {
      position: relative;
      content: '""',
      width: '222px',
      height: '100%'
    }

    & > .MuiPaper-root.MuiDrawer-paper.MuiDrawer-paperAnchorRight {
        position: absolute;
        width: 222px;
        top: 0;
        right: 0;
        display: flex;
        flex-direction: column; 
        align-items: flex-end;
        max-height: 100vh;
        box-sizing: border-box;
        padding-top: ${theme.spacing(1)};
        padding-bottom: ${theme.spacing(2)};
    }

    & > .MuiPaper-root .MuiToggleButtonGroup-root:not(:first-item) {
      margin-top: ${theme.spacing(1)};
    }

    & > .MuiPaper-root .MuiToggleButtonGroup-root {
      margin-bottom: ${theme.spacing(1)};
    }

    & > .MuiPaper-root .MuiToggleButtonGroup-root .MuiButtonBase-root {
      width: 100%;
      justify-content: center;
    }

    & > .MuiPaper-root > .MuiTypography-subtitle2, & > .MuiPaper-root > :not(.MuiDivider-root) {
      width: 100%;
      padding-left: ${theme.spacing(2)};
      padding-right: ${theme.spacing(2)};
    }

    & > .MuiPaper-root > .selection {
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

    & .textures {
      width: 222px;
      flex-grow: 2;
      overflow-y: auto;
      margin-bottom: ${theme.spacing(1)};
    }

    & > .MuiPaper-root > .MuiDivider-root {
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
  `
);

export default function GuiPanel() {
  // @TODO use a more standard error dialog vs using window.alert here
  const openFileSelector = useStageFilePicker(globalThis.alert);

  const viewOptions = useContext(ViewOptionsContext);
  const dispatch = useAppDispatch();
  const onExportSelectionJson = useModelSelectionExport();
  const onExportOBJFile = useSceneOBJFileDownloader();
  const onExportTextureFile = useCallback(() => {
    dispatch(downloadStageTextureFile());
  }, [dispatch]);
  const modelIndex = useAppSelector(selectModelIndex);
  const modelCount = useAppSelector(selectModelCount);
  const objectIndex = useAppSelector(selectObjectIndex);
  const objectSelectionType = useAppSelector(selectObjectSelectionType);
  const model = useAppSelector(selectModel);
  const textureDefs = useAppSelector(selectTextureDefs);
  const hasLoadedStageTextureFile = useAppSelector(
    selectHasLoadedStageTextureFile
  );

  const selectedMeshTexture: number = useMemo(() => {
    const textureIndex = model?.meshes?.[objectIndex]?.textureIndex;

    return typeof textureIndex === 'number' ? textureIndex : -1;
  }, [model, objectIndex]);

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

  const onSetShowAxesHelper = useCallback(
    (_: SyntheticEvent<Element, Event>, value: boolean) => {
      viewOptions.setShowAxesHelper(value);
    },
    [viewOptions.setShowAxesHelper]
  );

  const onSetShowPolygonAddresses = useCallback(
    (_: SyntheticEvent<Element, Event>, value: boolean) => {
      viewOptions.setShowPolygonAddresses(value);
    },
    [viewOptions.setShowPolygonAddresses]
  );

  const onSetShowSceneCursor = useCallback(
    (_: SyntheticEvent<Element, Event>, value: boolean) => {
      viewOptions.setShowSceneCursor(value);
    },
    [viewOptions.setShowSceneCursor]
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
    <StyledDrawer variant='permanent' anchor='right'>
      <Divider flexItem>
        <Typography variant='subtitle2' textAlign='left' width='100%'>
          Models
        </Typography>
      </Divider>
      <div className='selection'>
        <Grid container className={'property-table'}>
          <Grid xs={8}>
            <Typography variant='body1' textAlign='right'>
              Model Count
            </Typography>
          </Grid>
          <Grid xs={4}>
            <Typography variant='button' textAlign='right'>
              {modelCount}
            </Typography>
          </Grid>
          <Grid xs={8}>
            <Typography variant='body1' textAlign='right'>
              Model Index
            </Typography>
          </Grid>
          <Grid xs={4}>
            <Typography variant='button' textAlign='right'>
              {modelIndex === -1 ? 'N/A' : modelIndex}
            </Typography>
          </Grid>
          <Grid xs={8}>
            <Typography variant='body1' textAlign='right'>
              Object Index
            </Typography>
          </Grid>
          <Grid xs={4}>
            <Typography variant='button' textAlign='right'>
              {objectIndex === -1 ? 'N/A' : objectIndex}
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
                  Download a blender .obj file to import representing the
                  current in-scene model.
                </p>
                <p>
                  ⚠️ Note that this feature is WIP. There are known issues with
                  vertex ordering ⚠️
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
              Export Blender OBJ
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
            control={<Checkbox checked={viewOptions.showPolygonAddresses} />}
            label='Addresses'
            labelPlacement='start'
            onChange={onSetShowPolygonAddresses}
          />
        )}
        <FormControlLabel
          control={<Checkbox checked={viewOptions.showAxesHelper} />}
          label='Axes Helper'
          labelPlacement='start'
          onChange={onSetShowAxesHelper}
        />
        <FormControlLabel
          control={<Checkbox checked={viewOptions.showSceneCursor} />}
          label='Scene Cursor'
          labelPlacement='start'
          onChange={onSetShowSceneCursor}
        />
      </div>
      {!hasLoadedStageTextureFile ? undefined : (
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
    </StyledDrawer>
  );
}
