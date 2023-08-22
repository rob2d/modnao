import {
  Checkbox,
  FormControlLabel,
  Slider,
  styled,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import GuiPanelSection from './GuiPanelSection';
import { SyntheticEvent, useCallback, useContext } from 'react';
import ViewOptionsContext, {
  MeshDisplayMode
} from '@/contexts/ViewOptionsContext';
import {
  mdiAccountHardHat,
  mdiAxisArrow,
  mdiCursorDefaultOutline,
  mdiFlipToBack,
  mdiSignCaution
} from '@mdi/js';
import Icon from '@mdi/react';
import PaletteEditor from './PaletteEditor';

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

const TOOLTIP_DISCLAIMER_ICON_STYLE = {
  display: 'inline-block',
  position: 'relative',
  top: '4px',
  marginTop: '-4px'
} as const;

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

  const onSetPreviewUvClipping = useCallback(
    (_: SyntheticEvent<Element, Event>, value: boolean) => {
      viewOptions.setPreviewUvClipping(value);
    },
    [viewOptions.previewUvClipping]
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
        {viewOptions.meshDisplayMode !== 'wireframe' ? undefined : (
          <Tooltip
            title='Toggle selected polygon addresess visibility'
            placement='top-start'
          >
            <FormControlLabel
              control={
                <Checkbox checked={viewOptions.objectAddressesVisible} />
              }
              label='Addresses'
              labelPlacement='start'
              onChange={onSetObjectAddressesVisible}
            />
          </Tooltip>
        )}
        <div className='settings-row'>
          <Tooltip title='Disable Backface Culling / Make material visible on both sides of polygons'>
            <FormControlLabel
              control={
                <Checkbox checked={viewOptions.disableBackfaceCulling} />
              }
              label={<Icon path={mdiFlipToBack} size={1} />}
              labelPlacement='start'
              onChange={onSetDisableBackfaceCulling}
            />
          </Tooltip>
          <Tooltip title='Toggle axes helper visibility'>
            <FormControlLabel
              control={<Checkbox checked={viewOptions.axesHelperVisible} />}
              label={<Icon path={mdiAxisArrow} size={1} />}
              labelPlacement='start'
              onChange={onSetAxesHelperVisible}
            />
          </Tooltip>
          <Tooltip title='Toggle scene cursor visibility'>
            <FormControlLabel
              control={<Checkbox checked={viewOptions.sceneCursorVisible} />}
              label={<Icon path={mdiCursorDefaultOutline} size={1} />}
              labelPlacement='start'
              onChange={onSetSceneCursorVisible}
            />
          </Tooltip>
        </div>
        <div className='experimental-divider' />
        <Tooltip
          title={
            <div>
              Preview UV Clip Paths when selecting a polygon that has a texture.
              <hr />
              <div style={TOOLTIP_DISCLAIMER_ICON_STYLE}>
                <Icon path={mdiSignCaution} size={0.75} />
                <Icon path={mdiAccountHardHat} size={0.75} />
              </div>
              This feature is an early beta/work in progress and does not work
              on all scenarios; it might give you some useful hints 60-80% of
              the time.
              <div style={TOOLTIP_DISCLAIMER_ICON_STYLE}>
                <Icon path={mdiAccountHardHat} size={0.75} />
                <Icon path={mdiSignCaution} size={0.75} />
              </div>
            </div>
          }
        >
          <FormControlLabel
            control={<Checkbox checked={viewOptions.previewUvClipping} />}
            label={'View UV Paths'}
            labelPlacement='start'
            onChange={onSetPreviewUvClipping}
          />
        </Tooltip>
      </Styled>
    </GuiPanelSection>
  );
}
