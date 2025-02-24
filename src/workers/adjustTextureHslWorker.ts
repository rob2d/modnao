import adjustTextureHsl from '../utils/textures/adjustTextureHsl';
import { SourceTextureData } from '../utils/textures/SourceTextureData';
import HslValues from '../utils/textures/HslValues';

export type AdjustTextureHslWorkerPayload = {
  textureIndex: number;
  sourceTextureData: SourceTextureData;
  width: number;
  height: number;
  hsl: HslValues;
};

export default async function adjustTextureHslWorker({
  sourceTextureData,
  textureIndex,
  hsl,
  width,
  height
}: AdjustTextureHslWorkerPayload) {
  const promises = [sourceTextureData.translucent, sourceTextureData.opaque]
    .filter((sourceUrl): sourceUrl is string => Boolean(sourceUrl))
    .map((sourceUrl) => adjustTextureHsl(sourceUrl, width, height, hsl));

  const [translucent, opaque] = await Promise.all(promises);

  return {
    hsl,
    textureIndex,
    width,
    height,
    bufferUrls: {
      translucent: translucent.objectUrl,
      opaque: opaque.objectUrl
    },
    dataUrls: {
      translucent: translucent.dataUrl,
      opaque: opaque.dataUrl
    }
  };
}
