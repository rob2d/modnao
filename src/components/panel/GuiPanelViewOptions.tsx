import {
  FormControlLabel,
  Slider,
  styled,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import GuiPanelSection from './GuiPanelSection';
import { SyntheticEvent, useCallback, useContext } from 'react';
import ViewOptionsContext, {
  MeshDisplayMode
} from '@/contexts/ViewOptionsContext';
import {
  mdiAxisArrow,
  mdiCodeArray,
  mdiCursorDefaultOutline,
  mdiFlipToBack,
  mdiFormatColorFill,
  mdiTangram
} from '@mdi/js';
import PaletteEditor from './PaletteEditor';
import ViewOptionCheckbox from './ViewOptionCheckbox';

const Styled = styled('div')(
  {
    shouldForwardProp: (prop: string) =>
      prop !== 'textColor' && prop !== 'buttonTextColor'
  },
  ({ theme }) => `
  & .MuiSlider-root {
    width: calc(100% - 124px);
    margin-left: ${theme.spacing(2)};
    margin-right: ${theme.spacing(1)};
  }
  
  & .display-mode {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  & .settings-row .MuiTypography-root.MuiFormControlLabel-label {
    display: flex;
    align-items: center;
  }
  
  & .settings-row .MuiTypography-root.MuiFormControlLabel-label > svg {
    margin-right: -2px;
  }

  & .experimental-divider {
    width: 100%;
    height: 1px;
    border-bottom: ${theme.palette.error.main} 1px dashed;
  }
  `
);

export default function GuiPanelViewOptions() {
  const viewOptions = useContext(ViewOptionsContext);

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

  const onSetWireframeLineWidth = useCallback(
    (_: Event, v: number | number[]) => {
      const value = typeof v === 'number' ? v : v[0];
      viewOptions.setWireframeLineWidth(value);
    },
    [viewOptions.setWireframeLineWidth]
  );

  const onSetSceneCursorVisible = useCallback(
    (_: SyntheticEvent<Element, Event>, value: boolean) => {
      viewOptions.setSceneCursorVisible(value);
    },
    [viewOptions.setSceneCursorVisible]
  );

  const onSetDisableBackfaceCulling = useCallback(
    (_: SyntheticEvent<Element, Event>, value: boolean) => {
      viewOptions.setDisableBackfaceCulling(value);
    },
    [viewOptions.setDisableBackfaceCulling]
  );

  const onSetEnableVertexColors = useCallback(
    (_: SyntheticEvent<Element, Event>, value: boolean) => {
      viewOptions.setEnableVertexColors(value);
    },
    [viewOptions.setEnableVertexColors]
  );

  const onSetUvRegionsHighlighted = useCallback(
    (_: SyntheticEvent<Element, Event>, value: boolean) => {
      viewOptions.setUvRegionsHighlighted(value);
    },
    [viewOptions.uvRegionsHighlighted]
  );

  const onSetDevOptionsVisible = useCallback(
    (_: SyntheticEvent<Element, Event>, value: boolean) => {
      viewOptions.setDevOptionsVisible(value);
    },
    [viewOptions.devOptionsVisible]
  );

  return (
    <GuiPanelSection title='View Options'>
      <Styled className='view-options'>
        <Grid container className='property-table'>
          <Grid xs={12} className='display-mode'>
            <ToggleButtonGroup
              orientation='horizontal'
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
        <PaletteEditor />
        {viewOptions.meshDisplayMode !== 'wireframe' ? undefined : (
          <FormControlLabel
            control={
              <Slider
                size='small'
                min={1}
                max={10}
                defaultValue={4}
                aria-label='Small'
                valueLabelDisplay='auto'
                value={viewOptions.wireframeLineWidth}
                onChange={onSetWireframeLineWidth}
              />
            }
            label='Line Width'
            labelPlacement='start'
          />
        )}
        {viewOptions.meshDisplayMode !== 'wireframe' ||
        !viewOptions.devOptionsVisible ? undefined : (
          <ViewOptionCheckbox
            checked={viewOptions.objectAddressesVisible}
            tooltipHint='Toggle selected polygon addresess visibility'
            tooltipPlacement='top-start'
            label={'Addresses'}
            onChange={onSetObjectAddressesVisible}
          />
        )}
        <div className='settings-row'>
          <ViewOptionCheckbox
            checked={viewOptions.axesHelperVisible}
            tooltipHint='Toggle axes helper visibility'
            iconPath={mdiAxisArrow}
            onChange={onSetAxesHelperVisible}
          />
          <ViewOptionCheckbox
            checked={viewOptions.sceneCursorVisible}
            tooltipHint='Toggle scene cursor visibility'
            iconPath={mdiCursorDefaultOutline}
            onChange={onSetSceneCursorVisible}
          />
        </div>
        <div className='settings-row'>
          <ViewOptionCheckbox
            checked={viewOptions.disableBackfaceCulling}
            tooltipHint='Disable Backface Culling / Make material visible on both sides of polygons'
            iconPath={mdiFlipToBack}
            onChange={onSetDisableBackfaceCulling}
          />
          <ViewOptionCheckbox
            checked={viewOptions.uvRegionsHighlighted}
            tooltipHint={
              'View UV Clipping Regions when selecting a polygon that has an ' +
              'associated texture loaded.'
            }
            iconPath={mdiTangram}
            onChange={onSetUvRegionsHighlighted}
          />
        </div>
        <div className='settings-row'>
          {viewOptions.meshDisplayMode === 'wireframe' ? undefined : (
            <ViewOptionCheckbox
              checked={viewOptions.enableVertexColors}
              tooltipHint='Enable Vertex Colors; this is usually used for simulating shading and lighting effects.'
              iconPath={mdiFormatColorFill}
              onChange={onSetEnableVertexColors}
            />
          )}
          <ViewOptionCheckbox
            checked={viewOptions.devOptionsVisible}
            tooltipHint='Enable developer/debug option visibility'
            iconPath={mdiCodeArray}
            onChange={onSetDevOptionsVisible}
          />
        </div>
      </Styled>
    </GuiPanelSection>
  );
}
