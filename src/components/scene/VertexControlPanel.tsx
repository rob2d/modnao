import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
  Box,
  Divider,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';
import { useThrottle } from '@uidotdev/usehooks';
import {
  applySelectedVertexColor,
  applySelectedVertexGradient,
  type ApplySelectedVertexGradientPayload,
  applySelectedVertexHsl,
  type ApplySelectedVertexHslPayload,
  type VertexColorUpdate
} from '@/modules/model-data';
import { useAppDispatch } from '@/storeTypings';
import type { HslValues } from '@/utils/textures';
import {
  GradientVertexColorControls,
  HslVertexColorControls,
  PickVertexColorControls
} from './vertex_controls';

type VertexColorEditMode = 'editHsl' | 'pickColor' | 'gradientSelection';

const DEFAULT_HSL = {
  h: 0,
  s: 0,
  l: 0
};

interface VertexControlPanelProps {
  selectedVertexColors: VertexColorUpdate[];
  selectedVertexCount: number;
}

export default function VertexControlPanel({
  selectedVertexColors,
  selectedVertexCount
}: VertexControlPanelProps) {
  const dispatch = useAppDispatch();
  const [colorEditMode, setColorEditMode] =
    useState<VertexColorEditMode>('editHsl');
  const [hsl, setHsl] = useState<HslValues>(DEFAULT_HSL);
  const [baseVertexColors, setBaseVertexColors] =
    useState(selectedVertexColors);
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [vertexControlPanelEl, setVertexControlPanelEl] =
    useState<HTMLDivElement | null>(null);
  const selectedVertexColorsRef = useRef(selectedVertexColors);
  const processedHsl = useThrottle(hsl, 75);
  const hasEditableVertices = selectedVertexColors.length > 0;
  const hasNonEditableSelectedVertices =
    selectedVertexCount > selectedVertexColors.length;
  const vertexEditabilityMessage = !hasEditableVertices
    ? 'No vertices with editable colors in selection.'
    : hasNonEditableSelectedVertices
      ? 'Some vertices selected do not have editable colors'
      : undefined;

  const onPickColor = useCallback(
    (hexColor: string) => {
      dispatch(applySelectedVertexColor({ hexColor }));
    },
    [dispatch]
  );

  const onAdjustHsl = useCallback(
    (payload: ApplySelectedVertexHslPayload) => {
      dispatch(applySelectedVertexHsl(payload));
    },
    [dispatch]
  );

  const onApplyGradient = useCallback(
    (payload: ApplySelectedVertexGradientPayload) => {
      dispatch(applySelectedVertexGradient(payload));
    },
    [dispatch]
  );

  useEffect(() => {
    selectedVertexColorsRef.current = selectedVertexColors;
  }, [selectedVertexColors]);

  useEffect(() => {
    if (colorEditMode !== 'editHsl' || baseVertexColors.length === 0) {
      return;
    }

    onAdjustHsl({
      baseVertexColors,
      hsl: processedHsl
    });
  }, [baseVertexColors, colorEditMode, onAdjustHsl, processedHsl]);

  const onSetH = useCallback((h: number) => {
    setHsl((prev) => ({ ...prev, h }));
  }, []);

  const onSetS = useCallback((s: number) => {
    setHsl((prev) => ({ ...prev, s }));
  }, []);

  const onSetL = useCallback((l: number) => {
    setHsl((prev) => ({ ...prev, l }));
  }, []);

  const onSetVertexControlPanelEl = useCallback(
    (element: HTMLDivElement | null) => {
      setVertexControlPanelEl(element);
    },
    []
  );

  const controlsByMode = {
    editHsl: () => (
      <HslVertexColorControls
        hsl={hsl}
        onSetH={onSetH}
        onSetS={onSetS}
        onSetL={onSetL}
      />
    ),
    pickColor: () => (
      <PickVertexColorControls
        selectedColor={selectedColor}
        onChangeSelectedColor={setSelectedColor}
        onPickColor={onPickColor}
      />
    ),
    gradientSelection: () => (
      <GradientVertexColorControls
        popoverAnchorEl={vertexControlPanelEl}
        onApplyGradient={onApplyGradient}
      />
    )
  } satisfies Record<VertexColorEditMode, () => ReactNode>;

  return (
    <Paper
      ref={onSetVertexControlPanelEl}
      elevation={4}
      sx={{
        position: 'absolute',
        top: 'calc(var(--mui-spacing) * 6)',
        right: 'var(--mui-spacing)',
        width: 260,
        zIndex: 2,
        pointerEvents: 'all',
        backgroundColor: 'var(--mui-palette-sceneControl-background)',
        backdropFilter: 'blur(8px)'
      }}
    >
      <Box sx={{ px: 1.5, py: 1 }}>
        <Typography variant='subtitle2'>Vertex Color Edit</Typography>
        {!hasEditableVertices ? null : (
          <>
            <ToggleButtonGroup
              exclusive
              fullWidth
              size='small'
              color='secondary'
              value={colorEditMode}
              onChange={(_, nextMode: VertexColorEditMode | null) => {
                if (!nextMode || nextMode === colorEditMode) {
                  return;
                }

                if (nextMode === 'editHsl') {
                  setHsl(DEFAULT_HSL);
                  setBaseVertexColors(selectedVertexColorsRef.current);
                }

                setColorEditMode(nextMode);
              }}
              aria-label='Vertex color edit mode'
              sx={{ mt: 1 }}
            >
              <ToggleButton value='editHsl'>HSL</ToggleButton>
              <ToggleButton value='pickColor'>Color</ToggleButton>
              <ToggleButton value='gradientSelection'>Gradient</ToggleButton>
            </ToggleButtonGroup>
            <Box sx={{ mt: 1 }}>{controlsByMode[colorEditMode]()}</Box>
          </>
        )}
        {!vertexEditabilityMessage ? null : (
          <>
            <Divider sx={{ mt: 1, borderColor: 'textDeemphasized' }} />
            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1 }}
            >
              <WarningAmberIcon
                fontSize='small'
                sx={{
                  flexShrink: 0,
                  mr: 1,
                  fill: 'var(--mui-palette-text-deemphasized)'
                }}
              />
              <Typography
                color='textDeemphasized'
                variant='body2'
                sx={{ flexGrow: 1, fontStyle: 'italic' }}
              >
                {vertexEditabilityMessage}
              </Typography>
            </Box>
          </>
        )}
      </Box>
    </Paper>
  );
}
