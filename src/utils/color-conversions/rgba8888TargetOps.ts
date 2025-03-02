import { RgbaColor, TextureColorFormat } from '../textures';
import argb1555ToRgba8888 from './argb1555ToRgba8888';
import argb4444ToRgba8888 from './argb4444ToRgba8888';
import rgb565ToRgba8888 from './rgb565ToRgba8888';

const unsupportedConversion = () => ({ r: 0, g: 0, b: 0, a: 0 });

const rgba8888TargetOps: Record<
  TextureColorFormat,
  (color: number) => RgbaColor
> = {
  RGB565: rgb565ToRgba8888,
  ARGB1555: argb1555ToRgba8888,
  ARGB4444: argb4444ToRgba8888,
  RGB555: unsupportedConversion,
  ARGB8888: unsupportedConversion
};

export default rgba8888TargetOps;
