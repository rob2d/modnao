import type { HslValues } from '../textures/HslValues';
import hslToRgb from './hslToRgb';
import normalizedColorChannelToByte from './normalizedColorChannelToByte';
import rgbToHsl from './rgbToHsl';

export default function adjustNormalizedColorHsl(
  color: NLColorRGBA,
  hsl: HslValues
): NLColorRGBA {
  const { h, s, l } = rgbToHsl(
    normalizedColorChannelToByte(color[0]),
    normalizedColorChannelToByte(color[1]),
    normalizedColorChannelToByte(color[2])
  );
  const adjustedH = (h + hsl.h + 360) % 360;
  const adjustedS = Math.max(0, Math.min(s + hsl.s, 100));
  const adjustedL = Math.max(0, Math.min(l + hsl.l, 100));
  const { r, g, b } = hslToRgb(adjustedH, adjustedS, adjustedL);

  return [r / 0xff, g / 0xff, b / 0xff, color[3]];
}
