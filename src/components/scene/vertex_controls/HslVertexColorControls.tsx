import { List } from '@mui/material';
import NumericSliderInput from '@/components/NumericSliderInput';
import type { HslValues } from '@/utils/textures';

interface HslVertexColorControlsProps {
  hsl: HslValues;
  onSetH: (h: number) => void;
  onSetS: (s: number) => void;
  onSetL: (l: number) => void;
}

export default function HslVertexColorControls({
  hsl,
  onSetH,
  onSetS,
  onSetL
}: HslVertexColorControlsProps) {
  return (
    <List sx={{ p: 0 }}>
      <NumericSliderInput
        labelTooltip='Hue'
        label='H'
        defaultValue={0}
        min={-180}
        max={180}
        value={hsl.h}
        onChange={onSetH}
      />
      <NumericSliderInput
        labelTooltip='Saturation'
        label='S'
        defaultValue={0}
        min={-100}
        max={100}
        value={hsl.s}
        onChange={onSetS}
      />
      <NumericSliderInput
        labelTooltip='Lightness'
        label='L'
        defaultValue={0}
        min={-100}
        max={100}
        value={hsl.l}
        onChange={onSetL}
      />
    </List>
  );
}
