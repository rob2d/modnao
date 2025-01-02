import {
  FormControlLabel,
  Slider,
  styled,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import Grid from '@mui/material/Grid2'; // Grid version 2
import GuiPanelSection from './GuiPanelSection';
import { SyntheticEvent, useCallback, useContext, useMemo } from 'react';
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

  .expanded & .display-mode {
    margin-top: ${theme.spacing(1)};
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
      viewOptions.setMeshDisplayMode(mode);
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

  const responsiveSettingsRows = useMemo(() => {
    const settingsItems: (JSX.Element | undefined)[] = [
      <ViewOptionCheckbox
        key='axes-visibility'
        checked={viewOptions.axesHelperVisible}
        tooltipHint='Toggle axes helper visibility'
        iconPath={mdiAxisArrow}
        onChange={onSetAxesHelperVisible}
      />,
      <ViewOptionCheckbox
        key='cursor-visible'
        checked={viewOptions.sceneCursorVisible}
        tooltipHint='Toggle scene cursor visibility'
        iconPath={mdiCursorDefaultOutline}
        onChange={onSetSceneCursorVisible}
      />,
      <ViewOptionCheckbox
        key='disable-backface-culling'
        checked={viewOptions.disableBackfaceCulling}
        tooltipHint='Disable Backface Culling / Make material visible on both sides of polygons'
        iconPath={mdiFlipToBack}
        onChange={onSetDisableBackfaceCulling}
      />,
      <ViewOptionCheckbox
        key='uv-regions-highlighted'
        checked={viewOptions.uvRegionsHighlighted}
        tooltipHint={
          'View UV Clipping Regions when selecting a polygon that has an ' +
          'associated texture loaded.'
        }
        iconPath={mdiTangram}
        onChange={onSetUvRegionsHighlighted}
      />
    ];

    settingsItems.push(
      viewOptions.meshDisplayMode !== 'wireframe' ? (
        <ViewOptionCheckbox
          key='vertex-colors'
          checked={viewOptions.enableVertexColors}
          tooltipHint='Enable Vertex Colors; this is usually used for simulating shading and lighting effects.'
          iconPath={mdiFormatColorFill}
          onChange={onSetEnableVertexColors}
        />
      ) : undefined
    );

    settingsItems.push(
      <ViewOptionCheckbox
        key='dev-options-visible'
        checked={viewOptions.devOptionsVisible}
        tooltipHint='Enable developer/debug option visibility'
        iconPath={mdiCodeArray}
        onChange={onSetDevOptionsVisible}
      />
    );

    const settingsRows: JSX.Element[] = [];

    const settingsPerRow = viewOptions.guiPanelExpansionLevel <= 1 ? 2 : 4;
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
  }, [viewOptions]);

  return (
    <GuiPanelSection title='View Options'>
      <Styled className='view-options'>
        <Grid container className='property-table'>
          <Grid
            className='display-mode'
            size={viewOptions.guiPanelExpansionLevel <= 1 ? 12 : 6}
          >
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
          <Grid size={viewOptions.guiPanelExpansionLevel <= 1 ? 12 : 6}>
            <PaletteEditor />
          </Grid>
        </Grid>
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
            tooltipHint='Toggle selected polygon addresses visibility'
            tooltipPlacement='top-start'
            label={'Addresses'}
            onChange={onSetObjectAddressesVisible}
          />
        )}
        {responsiveSettingsRows}
      </Styled>
    </GuiPanelSection>
  );
}
