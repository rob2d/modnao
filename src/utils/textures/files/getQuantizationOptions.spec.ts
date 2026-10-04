import type { TextureFileType } from '@/types';
import getQuantizeOptions from './getQuantizationOptions';

describe('texture export quantization', () => {
  it.each<[TextureFileType, number]>([
    ['mvc2-intro-characters', 256],
    ['mvc2-intro-cable-ruby', 512]
  ])('uses a moderate non-dithered palette for %s', (type, width) => {
    expect(getQuantizeOptions(type, width)).toEqual({
      colors: 512,
      dithering: false
    });
  });

  it.each<[TextureFileType, number, number]>([
    ['mvc2-character-portraits', 64, 44],
    ['mvc2-character-portraits', 256, 112],
    ['cvs2-console-menu', 256, 512],
    ['mvc2-selection-textures', 256, 504],
    ['mvc2-character-win', 256, 256]
  ])('preserves the existing %s palette at width %i', (type, width, colors) => {
    expect(getQuantizeOptions(type, width)).toEqual({
      colors,
      dithering: false
    });
  });

  it('does not quantize formats without a configured policy', () => {
    expect(getQuantizeOptions('mvc2-font-file', 256)).toBeUndefined();
  });
});
