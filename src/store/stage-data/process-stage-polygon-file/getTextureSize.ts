import { TextureSize } from './TextureSize';

export default function getTextureSize(value: number) {
  const baseWidth = Math.floor((value % 64) / 8);
  const baseHeight = value % 8;
  const width = Math.pow(2, 3 + baseWidth);
  const height = Math.pow(2, 3 + baseHeight);

  return [width, height] as TextureSize;
}
