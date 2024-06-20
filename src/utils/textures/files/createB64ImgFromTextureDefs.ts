import { NLTextureDef } from '@/types/NLAbstractions';
import { objectUrlToBuffer } from '@/utils/data';
import { SourceTextureData } from '../SourceTextureData';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { Jimp } = globalThis as any;

export default async function createImgFromTextureDef({
  textureDef,
  asTranslucent
}: {
  textureDef: NLTextureDef;
  asTranslucent: boolean;
}) {
  const pixelsObjectUrls = textureDef.bufferUrls as SourceTextureData;
  const bufferUrl =
    (!asTranslucent
      ? pixelsObjectUrls.opaque || pixelsObjectUrls.translucent
      : pixelsObjectUrls.translucent) || '';

  const pixels = new Uint8ClampedArray(await objectUrlToBuffer(bufferUrl));

  const image = await Jimp.read({
    data: pixels,
    width: textureDef.width,
    height: textureDef.height
  });

  return (await image.getBase64Async(Jimp.MIME_PNG)) as string;
}
