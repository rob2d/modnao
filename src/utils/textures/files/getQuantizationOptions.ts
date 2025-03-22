import { TextureFileType } from './textureFileTypeMap';

type QuantizeOptions = {
  colors: number;
  dithering: boolean;
};

export default function getQuantizeOptions(
  textureFileType: TextureFileType,
  width: number
): QuantizeOptions | undefined {
  const optionsMap: Record<TextureFileType, QuantizeOptions | undefined> = {
    'mvc2-character-portraits': {
      dithering: false,
      colors: width === 64 ? 44 : 112
    },
    'cvs2-console-menu': { dithering: false, colors: 512 },
    'mvc2-selection-textures': { dithering: false, colors: 504 },
    'mvc2-special-effects': undefined,
    'mvc2-end-file': undefined,
    'vs2-stage-file': undefined,
    'vs2-demo-model': undefined,
    'mvc2-stage-preview': undefined,
    'mvc2-character-win': undefined
  };
  return optionsMap[textureFileType];
}
