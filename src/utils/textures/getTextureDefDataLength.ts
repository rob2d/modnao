import type { NLUITextureDef } from '@/types';
import {
  TEXTURE_COLOR_SIZE,
  VQ_CODEBOOK_BYTE_SIZE,
  VQ_CODEBOOK_VECTOR_LENGTH,
  VQ_TEXTURE_ENCODE_TYPE
} from './VqFormatConstants';

export default function getTextureDefDataLength(
  textureDef: Pick<NLUITextureDef, 'type' | 'width' | 'height'>
): number {
  if (textureDef.type === VQ_TEXTURE_ENCODE_TYPE) {
    return (
      VQ_CODEBOOK_BYTE_SIZE +
      (textureDef.width * textureDef.height) / VQ_CODEBOOK_VECTOR_LENGTH
    );
  }

  return textureDef.width * textureDef.height * TEXTURE_COLOR_SIZE;
}
