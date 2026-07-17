import type { ReactNode } from 'react';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
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
  default as SceneOptionsContext,
  type VertexColorEditMode
} from '@/contexts/SceneOptionsContext';
import {
  applySelectedVertexColor,
  applySelectedVertexGradient,
  type ApplySelectedVertexGradientPayload,
  applySelectedVertexHsl,
  type ApplySelectedVertexHslPayload,
  type VertexColorUpdate
} from '@/modules/model-data';
import { useAppDispatch } from '@/storeTypings';
import { rgbToHsl } from '@/utils/color-conversions';
import type { HslValues } from '@/utils/textures';
import type { RGBColor } from 'react-color';
import {
  GradientVertexColorControls,
  HslVertexColorControls,
  PickVertexColorControls
} from './vertex_controls';

const DEFAULT_HSL = {
  h: 0,
  s: 0,
  l: 0
};

interface GradientVertexColors {
  startColor: RGBColor;
  endColor: RGBColor;
}

const normalizedColorChannelToByte = (channel: number) =>
  Math.round(Math.min(Math.max(channel, 0), 1) * 0xff);

const vertexColorToRgbColor = ([r, g, b]: NLColorRGBA): RGBColor => ({
  r: normalizedColorChannelToByte(r),
  g: normalizedColorChannelToByte(g),
  b: normalizedColorChannelToByte(b)
});

const getRgbColorKey = ({ r, g, b }: RGBColor) => `${r},${g},${b}`;

const getHueDistance = (startHue: number, endHue: number) => {
  const absoluteDistance = Math.abs(startHue - endHue);

  return Math.min(absoluteDistance, 360 - absoluteDistance);
};

const getColorDistanceScore = (startColor: RGBColor, endColor: RGBColor) => {
  const startHsl = rgbToHsl(startColor.r, startColor.g, startColor.b);
  const endHsl = rgbToHsl(endColor.r, endColor.g, endColor.b);
  const redDistance = startColor.r - endColor.r;
  const greenDistance = startColor.g - endColor.g;
  const blueDistance = startColor.b - endColor.b;

  return (
    getHueDistance(startHsl.h, endHsl.h) / 180 +
    Math.abs(startHsl.s - endHsl.s) / 100 +
    Math.abs(startHsl.l - endHsl.l) / 100 +
    Math.hypot(redDistance, greenDistance, blueDistance) /
      Math.hypot(0xff, 0xff, 0xff)
  );
};

export const getDefaultGradientVertexColors = (
  selectedVertexColors: VertexColorUpdate[]
): GradientVertexColors | undefined => {
  const uniqueColorsByKey = new Map<string, RGBColor>();

  selectedVertexColors.forEach(({ color }) => {
    const rgbColor = vertexColorToRgbColor(color);

    uniqueColorsByKey.set(getRgbColorKey(rgbColor), rgbColor);
  });

  const uniqueColors = Array.from(uniqueColorsByKey.values());

  if (uniqueColors.length === 0) {
    return undefined;
  }

  if (uniqueColors.length === 1) {
    return {
      startColor: uniqueColors[0],
      endColor: uniqueColors[0]
    };
  }

  const selectedColors = uniqueColors.reduce<GradientVertexColors>(
    (currentSelectedColors, startColor, startIndex) => {
      const nextSelectedColors = uniqueColors
        .slice(startIndex + 1)
        .reduce<GradientVertexColors>((currentPair, endColor) => {
          const currentPairScore = getColorDistanceScore(
            currentPair.startColor,
            currentPair.endColor
          );
          const nextPairScore = getColorDistanceScore(startColor, endColor);

          return nextPairScore <= currentPairScore
            ? currentPair
            : { startColor, endColor };
        }, currentSelectedColors);

      return nextSelectedColors;
    },
    {
      startColor: uniqueColors[0],
      endColor: uniqueColors[1]
    }
  );

  return selectedColors;
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
  const { vertexColorEditMode, setVertexColorEditMode } =
    useContext(SceneOptionsContext);
  const [hsl, setHsl] = useState<HslValues>(DEFAULT_HSL);
  const [baseVertexColors, setBaseVertexColors] =
    useState(selectedVertexColors);
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [vertexControlPanelEl, setVertexControlPanelEl] =
    useState<HTMLDivElement | null>(null);
  const selectedVertexColorsRef = useRef(selectedVertexColors);
  const processedHsl = useThrottle(hsl, 75);
  const defaultGradientVertexColors = useMemo(
    () => getDefaultGradientVertexColors(selectedVertexColors),
    [selectedVertexColors]
  );
  const selectedVertexSelectionKey = useMemo(
    () =>
      selectedVertexColors
        .map(({ contentAddress }) => contentAddress)
        .sort((firstAddress, secondAddress) => firstAddress - secondAddress)
        .join('|'),
    [selectedVertexColors]
  );
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
    if (vertexColorEditMode !== 'editHsl' || baseVertexColors.length === 0) {
      return;
    }

    onAdjustHsl({
      baseVertexColors,
      hsl: processedHsl
    });
  }, [baseVertexColors, onAdjustHsl, processedHsl, vertexColorEditMode]);

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
        key={selectedVertexSelectionKey}
        popoverAnchorEl={vertexControlPanelEl}
        defaultGradientVertexColors={defaultGradientVertexColors}
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
              value={vertexColorEditMode}
              onChange={(_, nextMode: VertexColorEditMode | null) => {
                if (!nextMode || nextMode === vertexColorEditMode) {
                  return;
                }

                if (nextMode === 'editHsl') {
                  setHsl(DEFAULT_HSL);
                  setBaseVertexColors(selectedVertexColorsRef.current);
                }

                setVertexColorEditMode(nextMode);
              }}
              aria-label='Vertex color edit mode'
              sx={{ mt: 1 }}
            >
              <ToggleButton value='editHsl'>Edit</ToggleButton>
              <ToggleButton value='pickColor'>Pick</ToggleButton>
              <ToggleButton value='gradientSelection'>Gradient</ToggleButton>
            </ToggleButtonGroup>
            <Box
              sx={{
                mt: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                gap: 0.25
              }}
            >
              {controlsByMode[vertexColorEditMode]()}
            </Box>
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
