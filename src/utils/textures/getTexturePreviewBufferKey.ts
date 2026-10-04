import type { TextureImageBufferKeys } from './TextureImageBufferKeys';

export default function getTexturePreviewBufferKey(
  bufferKeys: TextureImageBufferKeys | undefined,
  mode: 'opaque' | 'transparent'
) {
  return mode === 'opaque'
    ? bufferKeys?.opaque || bufferKeys?.translucent
    : bufferKeys?.translucent || bufferKeys?.opaque;
}
