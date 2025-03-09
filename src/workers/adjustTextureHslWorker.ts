import {
  adjustTextureHsl,
  HslValues,
  TextureImageBuffers
} from '@/utils/textures';

export type AdjustTextureHslWorkerPayload = {
  buffers: TextureImageBuffers;
  hsl: HslValues;
};

export default async function adjustTextureHslWorker({
  buffers,
  hsl
}: AdjustTextureHslWorkerPayload) {
  const [opaqueRgbaBuffer, translucentRgbaBuffer] = await Promise.all(
    [buffers.opaque, buffers.translucent].map((buffer) =>
      adjustTextureHsl(buffer as SharedArrayBuffer, hsl)
    )
  );

  return [opaqueRgbaBuffer, translucentRgbaBuffer];
}
