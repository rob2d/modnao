import ChangeHistoryIcon from '@mui/icons-material/ChangeHistory';
import DataArrayIcon from '@mui/icons-material/DataArray';
import FlipToBackIcon from '@mui/icons-material/FlipToBack';
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import MouseOutlinedIcon from '@mui/icons-material/MouseOutlined';
import StraightenIcon from '@mui/icons-material/Straighten';
import {
  Box,
  FormControlLabel,
  Slider,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import Grid from '@mui/material/Grid';
import GuiPanelSection from './GuiPanelSection';
import { JSX, SyntheticEvent, useCallback, useContext, useMemo } from 'react';
import SceneOptionsContext, {
  MeshDisplayMode
} from '@/contexts/SceneOptionsContext';
import PaletteEditor from './PaletteEditor';
import SceneOptionCheckbox from './SceneOptionCheckbox';

export default function GuiPanelViewOptions() {
  const sceneOptions = useContext(SceneOptionsContext);

  const onSetMeshDisplayMode = useCallback(
    (_: React.MouseEvent<HTMLElement>, mode: MeshDisplayMode) => {
      sceneOptions.setMeshDisplayMode(mode);
    },
    [sceneOptions.setMeshDisplayMode]
  );

  const onSetAxesHelperVisible = useCallback(
    (_: SyntheticEvent<Element, Event>, value: boolean) => {
      sceneOptions.setAxesHelperVisible(value);
    },
    [sceneOptions.setAxesHelperVisible]
  );

  const onSetObjectAddressesVisible = useCallback(
    (_: SyntheticEvent<Element, Event>, value: boolean) => {
      sceneOptions.setObjectAddressesVisible(value);
    },
    [sceneOptions.setObjectAddressesVisible]
  );

  const onSetWireframeLineWidth = useCallback(
    (_: Event, v: number | number[]) => {
      const value = typeof v === 'number' ? v : v[0];
      sceneOptions.setWireframeLineWidth(value);
    },
    [sceneOptions.setWireframeLineWidth]
  );

  const onSetSceneCursorVisible = useCallback(
    (_: SyntheticEvent<Element, Event>, value: boolean) => {
      sceneOptions.setSceneCursorVisible(value);
    },
    [sceneOptions.setSceneCursorVisible]
  );

  const onSetShowBrowsedObjectHints = useCallback(
    (_: SyntheticEvent<Element, Event>, value: boolean) => {
      sceneOptions.setShowBrowsedObjectHints(value);
    },
    [sceneOptions.setShowBrowsedObjectHints]
  );

  const onSetDisableBackfaceCulling = useCallback(
    (_: SyntheticEvent<Element, Event>, value: boolean) => {
      sceneOptions.setDisableBackfaceCulling(value);
    },
    [sceneOptions.setDisableBackfaceCulling]
  );

  const onSetEnableVertexColors = useCallback(
    (_: SyntheticEvent<Element, Event>, value: boolean) => {
      sceneOptions.setEnableVertexColors(value);
    },
    [sceneOptions.setEnableVertexColors]
  );

  const onSetUvRegionsHighlighted = useCallback(
    (_: SyntheticEvent<Element, Event>, value: boolean) => {
      sceneOptions.setUvRegionsHighlighted(value);
    },
    [sceneOptions.uvRegionsHighlighted]
  );

  const onSetDevOptionsVisible = useCallback(
    (_: SyntheticEvent<Element, Event>, value: boolean) => {
      sceneOptions.setDevOptionsVisible(value);
    },
    [sceneOptions.devOptionsVisible]
  );

  const responsiveSettingsRows = useMemo(() => {
    const settingsItems: (JSX.Element | undefined)[] = [
      <SceneOptionCheckbox
        key='axes-visibility'
        checked={sceneOptions.axesHelperVisible}
        tooltipHint='Toggle axes helper visibility'
        icon={<StraightenIcon fontSize='small' />}
        onChange={onSetAxesHelperVisible}
      />,
      <SceneOptionCheckbox
        key='cursor-visible'
        checked={sceneOptions.sceneCursorVisible}
        tooltipHint='Toggle scene cursor visibility'
        icon={<MouseOutlinedIcon fontSize='small' />}
        onChange={onSetSceneCursorVisible}
      />,
      <SceneOptionCheckbox
        key='browsed-object-hints'
        checked={sceneOptions.showBrowsedObjectHints}
        tooltipHint='Toggle browsed object hints visibility'
        label='Hints'
        onChange={onSetShowBrowsedObjectHints}
      />,
      <SceneOptionCheckbox
        key='disable-backface-culling'
        checked={sceneOptions.disableBackfaceCulling}
        tooltipHint='Disable Backface Culling / Make material visible on both sides of polygons'
        icon={<FlipToBackIcon fontSize='small' />}
        onChange={onSetDisableBackfaceCulling}
      />,
      <SceneOptionCheckbox
        key='uv-regions-highlighted'
        checked={sceneOptions.uvRegionsHighlighted}
        tooltipHint={
          'View UV Clipping Regions when selecting a polygon that has an ' +
          'associated texture loaded.'
        }
        icon={<ChangeHistoryIcon fontSize='small' />}
        onChange={onSetUvRegionsHighlighted}
      />
    ];

    settingsItems.push(
      sceneOptions.meshDisplayMode !== 'wireframe' ? (
        <SceneOptionCheckbox
          key='vertex-colors'
          checked={sceneOptions.enableVertexColors}
          tooltipHint='Enable Vertex Colors; this is usually used for simulating shading and lighting effects.'
          icon={<FormatColorFillIcon fontSize='small' />}
          onChange={onSetEnableVertexColors}
        />
      ) : undefined
    );

    settingsItems.push(
      <SceneOptionCheckbox
        key='dev-options-visible'
        checked={sceneOptions.devOptionsVisible}
        tooltipHint='Enable developer/debug option visibility'
        icon={<DataArrayIcon fontSize='small' />}
        onChange={onSetDevOptionsVisible}
      />
    );

    const settingsRows: JSX.Element[] = [];

    const settingsPerRow = sceneOptions.guiPanelExpansionLevel <= 1 ? 2 : 4;
    for (let i = 0; i < settingsItems.length; i += settingsPerRow) {
      const newRowItems = [];

      for (let j = 0; j < settingsPerRow; j++) {
        newRowItems.push(settingsItems[i + j]);
      }

      settingsRows.push(
        <div className='settings-row' key={i}>
          {newRowItems}
        </div>
      );
    }

    return settingsRows;
  }, [sceneOptions]);

  return (
    <GuiPanelSection title='Scene Options'>
      <Box
        className='scene-options'
        sx={{
          '& .MuiSlider-root': {
            width: 'calc(100% - 124px)',
            ml: 2,
            mr: 1
          },
          '& .display-mode': {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end'
          },
          '.expanded & .display-mode': {
            mt: 1
          },
          '& .settings-row .MuiTypography-root.MuiFormControlLabel-label': {
            display: 'flex',
            alignItems: 'center'
          },
          '& .settings-row .MuiTypography-root.MuiFormControlLabel-label > svg':
            {
              mr: '-2px'
            },
          '& .experimental-divider': {
            width: '100%',
            height: '1px',
            borderBottom: '1px dashed var(--mui-palette-error-main)'
          }
        }}
      >
        <Grid container className='property-table'>
          <Grid
            className='display-mode'
            size={sceneOptions.guiPanelExpansionLevel <= 1 ? 12 : 6}
          >
            <ToggleButtonGroup
              orientation='horizontal'
              size='small'
              color='secondary'
              value={sceneOptions.meshDisplayMode}
              exclusive
              onChange={onSetMeshDisplayMode}
              aria-label='Mesh Display Mode Selection'
            >
              <ToggleButton value='wireframe'>wireframe</ToggleButton>
              <ToggleButton value='textured'>textured</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          <Grid size={sceneOptions.guiPanelExpansionLevel <= 1 ? 12 : 6}>
            <PaletteEditor />
          </Grid>
        </Grid>
        {sceneOptions.meshDisplayMode !== 'wireframe' ? undefined : (
          <FormControlLabel
            control={
              <Slider
                size='small'
                min={1}
                max={10}
                defaultValue={4}
                aria-label='Small'
                valueLabelDisplay='auto'
                value={sceneOptions.wireframeLineWidth}
                onChange={onSetWireframeLineWidth}
              />
            }
            label='Line Width'
            labelPlacement='start'
          />
        )}
        {sceneOptions.meshDisplayMode !== 'wireframe' ||
        !sceneOptions.devOptionsVisible ? undefined : (
          <SceneOptionCheckbox
            checked={sceneOptions.objectAddressesVisible}
            tooltipHint='Toggle selected polygon addresses visibility'
            tooltipPlacement='top-start'
            label={'Addresses'}
            onChange={onSetObjectAddressesVisible}
          />
        )}
        {responsiveSettingsRows}
      </Box>
    </GuiPanelSection>
  );
}
