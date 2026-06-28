import ChangeHistoryIcon from '@mui/icons-material/ChangeHistory';
import DataArrayIcon from '@mui/icons-material/DataArray';
import FlipToBackIcon from '@mui/icons-material/FlipToBack';
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import MouseOutlinedIcon from '@mui/icons-material/MouseOutlined';
import HelpCenterIcon from '@mui/icons-material/HelpCenter';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import { mdiCubeUnfolded, mdiFormatColorFill, mdiTextureBox } from '@mdi/js';
import {
  Box,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography
} from '@mui/material';
import Grid from '@mui/material/Grid';
import GuiPanelSection from './GuiPanelSection';
import { JSX, SyntheticEvent, useCallback, useContext, useMemo } from 'react';
import SceneOptionsContext, {
  MeshDisplayMode
} from '@/contexts/SceneOptionsContext';
import MdiSvgIcon from '../MdiSvgIcon';
import PaletteEditor from './PaletteEditor';
import SceneOptionCheckbox from './SceneOptionCheckbox';

const sceneCamSpeedDisplayMin = 1;
const sceneCamSpeedDisplayMax = 9;
const sceneCamSpeedMultiplierMin = 0.1;
const sceneCamSpeedMultiplierMax = 1;

function getSceneCamSpeedMultiplier(displayValue: number) {
  const displayRange = sceneCamSpeedDisplayMax - sceneCamSpeedDisplayMin;
  const multiplierRange =
    sceneCamSpeedMultiplierMax - sceneCamSpeedMultiplierMin;

  return (
    sceneCamSpeedMultiplierMin +
    ((displayValue - sceneCamSpeedDisplayMin) / displayRange) * multiplierRange
  );
}

function getSceneCamSpeedDisplayValue(multiplier: number) {
  const displayRange = sceneCamSpeedDisplayMax - sceneCamSpeedDisplayMin;
  const multiplierRange =
    sceneCamSpeedMultiplierMax - sceneCamSpeedMultiplierMin;

  return Math.round(
    sceneCamSpeedDisplayMin +
      ((multiplier - sceneCamSpeedMultiplierMin) / multiplierRange) *
        displayRange
  );
}

export default function GuiPanelViewOptions() {
  const sceneOptions = useContext(SceneOptionsContext);

  const onSetMeshDisplayMode = useCallback(
    (_: React.MouseEvent<HTMLElement>, mode: MeshDisplayMode | null) => {
      if (mode === null) {
        return;
      }

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

  const onSetWireframeLineWidth = useCallback(
    (_: Event, v: number | number[]) => {
      const value = typeof v === 'number' ? v : v[0];
      sceneOptions.setWireframeLineWidth(value);
    },
    [sceneOptions.setWireframeLineWidth]
  );

  const onSetSceneCamSpeed = useCallback(
    (_: Event, v: number | number[]) => {
      const value = typeof v === 'number' ? v : v[0];
      sceneOptions.setSceneCamSpeed(getSceneCamSpeedMultiplier(value));
    },
    [sceneOptions.setSceneCamSpeed]
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

  const settingFlagCheckboxes = useMemo(() => {
    const settingsItems: (JSX.Element | undefined)[] = [
      <SceneOptionCheckbox
        key='axes-visibility'
        checked={sceneOptions.axesHelperVisible}
        tooltipHint='Toggle axes/origin helper visibility'
        icon={<ViewInArIcon fontSize='small' />}
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
        icon={<HelpCenterIcon fontSize='small' />}
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
          tooltipHint='Enable Vertex Colors while using textured view mode.'
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

    return settingsItems.filter(
      (settingsItem): settingsItem is JSX.Element => settingsItem !== undefined
    );
  }, [sceneOptions]);

  return (
    <GuiPanelSection title='Scene Options'>
      <Box
        className='scene-options'
        sx={{
          '& .slider-setting': {
            display: 'inline-flex',
            flexDirection: 'column',
            width: '100%',
            pr: 1
          },
          '& .slider-setting:not(:first-of-type)': {
            mt: -1
          },
          '& .slider-setting-label': {
            color: 'var(--mui-palette-text-secondary)',
            fontSize: '0.75rem',
            lineHeight: 1,
            transform: 'translateY(5px)'
          },
          '& .slider-setting .MuiSlider-root': {
            width: '100%',
            mx: 0.5
          }
        }}
      >
        <Box
          sx={({ mixins }) => ({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            columnGap: 1,
            mb: 0.5,
            [`@container (max-width: ${mixins.guiPanelExpansionL1W})`]: {
              flexDirection: 'column',
              alignItems: 'stretch',
              rowGap: 1
            }
          })}
        >
          <Box
            sx={{
              display: 'flex',
              width: 'fit-content',
              alignItems: 'center',
              columnGap: 1
            }}
          >
            <Typography
              variant='caption'
              sx={{
                color: 'var(--mui-palette-text-secondary)',
                lineHeight: 1,
                whiteSpace: 'nowrap'
              }}
            >
              View Mode
            </Typography>
            <ToggleButtonGroup
              orientation='horizontal'
              size='small'
              color='secondary'
              value={sceneOptions.meshDisplayMode}
              exclusive
              onChange={onSetMeshDisplayMode}
              aria-label='Mesh Display Mode Selection'
            >
              <Tooltip title='Wireframe view'>
                <ToggleButton value='wireframe' aria-label='Wireframe view'>
                  <MdiSvgIcon path={mdiCubeUnfolded} fontSize='small' />
                </ToggleButton>
              </Tooltip>
              <Tooltip title='Textured view'>
                <ToggleButton value='textured' aria-label='Textured view'>
                  <MdiSvgIcon path={mdiTextureBox} fontSize='small' />
                </ToggleButton>
              </Tooltip>
              <Tooltip title='Vertex color visualization view'>
                <ToggleButton value='colors' aria-label='Vertex color view'>
                  <MdiSvgIcon path={mdiFormatColorFill} fontSize='small' />
                </ToggleButton>
              </Tooltip>
            </ToggleButtonGroup>
          </Box>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <PaletteEditor />
          </Box>
        </Box>
        <Box
          sx={({ mixins }) => ({
            display: 'flex',
            flexDirection: 'row',
            [`@container (max-width: ${mixins.guiPanelExpansionL1W})`]: {
              flexDirection: 'column'
            }
          })}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              justifyContent: 'flex-start',
              width: '100%'
            }}
          >
            {sceneOptions.meshDisplayMode !== 'wireframe' ? undefined : (
              <Box
                className='slider-setting'
                sx={{
                  width: '100%',
                  '&:nth-of-type(2)': { mt: -1 }
                }}
              >
                <Box className='slider-setting-label'>Line Width</Box>
                <Slider
                  size='small'
                  min={1}
                  max={10}
                  defaultValue={3}
                  aria-label='Line Width'
                  valueLabelDisplay='auto'
                  value={sceneOptions.wireframeLineWidth}
                  onChange={onSetWireframeLineWidth}
                />
              </Box>
            )}
            <Box className='slider-setting'>
              <Box className='slider-setting-label'>Cam Speed</Box>
              <Slider
                size='small'
                min={sceneCamSpeedDisplayMin}
                max={sceneCamSpeedDisplayMax}
                step={1}
                defaultValue={6}
                aria-label='Cam Speed'
                valueLabelDisplay='auto'
                value={getSceneCamSpeedDisplayValue(sceneOptions.sceneCamSpeed)}
                onChange={onSetSceneCamSpeed}
              />
            </Box>
          </Box>
          <Box
            sx={({ mixins }) => ({
              display: 'grid',
              gridTemplateColumns: 'repeat(4, auto)',
              justifyContent: 'end',
              width: '100%',
              [`@container (max-width: ${mixins.guiPanelExpansionL1W})`]: {
                gridTemplateColumns: 'repeat(3, auto)'
              },
              '& .MuiTypography-root.MuiFormControlLabel-label': {
                display: 'flex',
                alignItems: 'center'
              },
              '& .MuiTypography-root.MuiFormControlLabel-label > svg': {
                mr: '-2px'
              }
            })}
          >
            {settingFlagCheckboxes}
          </Box>
        </Box>
      </Box>
    </GuiPanelSection>
  );
}
