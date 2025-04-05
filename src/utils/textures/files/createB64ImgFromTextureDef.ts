import 'jimp';
import { NLUITextureDef } from '@/types/NLAbstractions';
import { TextureImageBufferKeys } from '../TextureImageBufferKeys';
import globalBuffers from '@/utils/data/globalBuffers';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { Jimp } = globalThis as any;

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

  const image = await Jimp.read({
    data: pixels,
    width: textureDef.width,
    height: textureDef.height
  });

  return (await image.getBase64Async(Jimp.MIME_PNG)) as string;
}
