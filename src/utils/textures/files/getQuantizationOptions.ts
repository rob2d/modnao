import { TextureFileType } from './textureFileTypeMap';

type QuantizeOptions = {
  colors: number;
  dithering: boolean;
};

export default function getQuantizeOptions(
  textureFileType: TextureFileType,
  width: number
): QuantizeOptions | undefined {
  const optionsMap: Partial<Record<TextureFileType, QuantizeOptions>> = {
    'mvc2-character-portraits': {
      dithering: false,
      colors: width === 64 ? 44 : 112
    },
    'cvs2-console-menu': { dithering: false, colors: 512 },
    'mvc2-selection-textures': { dithering: false, colors: 504 },
    'mvc2-character-win': { dithering: false, colors: 256 }
  };
  return optionsMap?.[textureFileType];
}
