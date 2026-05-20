import { Jimp } from 'jimp';
import { NLUITextureDef } from '@/types/NLAbstractions';
import { TextureImageBufferKeys } from '../TextureImageBufferKeys';
import globalBuffers from '@/utils/data/globalBuffers';

export default async function createImgFromTextureDef({
  textureDef,
  asTranslucent
}: {
  textureDef: NLUITextureDef;
  asTranslucent: boolean;
}) {
  const pixelBufferKeys = textureDef.bufferKeys as TextureImageBufferKeys;
  const bufferKey =
    (!asTranslucent
      ? pixelBufferKeys.opaque || pixelBufferKeys.translucent
      : pixelBufferKeys.translucent) || '';

  const pixels = globalBuffers.get(bufferKey);

  const image = Jimp.fromBitmap({
    data: pixels,
    width: textureDef.width,
    height: textureDef.height
  });

  return image.getBase64('image/png');
}
