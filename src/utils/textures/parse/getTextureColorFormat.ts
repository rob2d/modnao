import { TextureColorFormat } from '../TextureColorFormat';

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
      return 'ARGB4444';
    }
    case 3: {
      return 'ARGB8888';
    }
    default: {
      return 'RGB555';
    }
  }
}
