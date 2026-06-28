import { useState } from 'react';
import {
  ClampToEdgeWrapping,
  DataTexture,
  RepeatWrapping,
  RGBAFormat,
  SRGBColorSpace,
  Texture,
  UnsignedByteType,
  Vector2
} from 'three';
import type { NLUITextureDef } from '@/types';
import globalBuffers from '@/utils/data/globalBuffers';
import useClientEffect from './useClientEffect';

const TEXTURE_ROTATION = 1.5708;
const TEXTURE_CENTER = new Vector2(0.5, 0.5);

const textureTypes = ['opaque', 'translucent'] as const;

interface SceneTextureMapCacheEntry {
  texture: DataTexture;
  bufferKey: string;
}

export default function useSceneTextureMapCache(textureDefs: NLUITextureDef[]) {
  const [textureCacheMap, setTextureCacheMap] =
    useState<Map<string, SceneTextureMapCacheEntry>>();

  useClientEffect(() => {
    const nextMap = new Map<string, SceneTextureMapCacheEntry>();

    for (const textureDef of textureDefs) {
      textureTypes.forEach((type) => {
        const bufferKey = textureDef.bufferKeys[type];
        if (!bufferKey) {
          return;
        }

        [true, false].forEach((hRepeat) =>
          [true, false].forEach((vRepeat) => {
            const mapKey = `${bufferKey}-${Number(hRepeat)}-${Number(vRepeat)}`;

            if (!textureCacheMap?.has(mapKey)) {
              const pixels = globalBuffers.get(bufferKey);
              const texture = new DataTexture(
                pixels,
                textureDef.width,
                textureDef.height,
                RGBAFormat,
                UnsignedByteType,
                Texture.DEFAULT_MAPPING,
                hRepeat ? RepeatWrapping : ClampToEdgeWrapping,
                vRepeat ? RepeatWrapping : ClampToEdgeWrapping,
                undefined,
                undefined,
                undefined,
                SRGBColorSpace
              );
              texture.rotation = TEXTURE_ROTATION;
              texture.center = TEXTURE_CENTER;
              texture.repeat.y = -1;
              texture.flipY = false;
              texture.needsUpdate = true;
              nextMap.set(mapKey, { texture, bufferKey });
            } else {
              nextMap.set(
                mapKey,
                textureCacheMap.get(mapKey) as SceneTextureMapCacheEntry
              );
            }
          })
        );
      });
    }

    setTextureCacheMap(nextMap);
  }, [textureDefs]);

  return textureCacheMap;
}
