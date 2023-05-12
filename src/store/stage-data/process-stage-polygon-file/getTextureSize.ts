import { TextureSize } from './TextureSize';

export default function getTextureSize(value: number): TextureSize {
  const baseValue = Math.floor((value % 64) / 8);
  const dimension = Math.pow(2, 3 + baseValue);

  return `${dimension}x${dimension}` as TextureSize;
}
