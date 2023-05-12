import { TextureColorFormat } from './TextureColorFormat';

export default function getTextureColorFormat(
  value: number
): TextureColorFormat {
  switch (value) {
    case 0: {
      return 'ARGB1555';
    }
    case 1: {
      return 'RGB565';
    }
    case 2: {
      return 'RGB444';
    }
    case 3: {
      return 'ARGB8888';
    }
    default: {
      return 'RGB555';
    }
  }
}
