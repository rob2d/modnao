import { closeDialog, showDialog } from '@/modules/dialogs/dialogsStore';
import {
  $textureDefs,
  replaceTextureImage
} from '@/modules/model-data/modelDataStore';
import globalBuffers from '@/utils/data/globalBuffers';
import loadRGBABuffersFromFile from '@/utils/images/loadRGBABuffersFromFile';
import { batch, signal } from '@preact-signals/safe-react';
import type { ReplacementImage } from './replaceTextureTypes';

export const $textureIndex = signal(-1);
export const $replacementImage = signal<ReplacementImage | undefined>(
  undefined
);

export function resetReplaceTexture() {
  batch(() => {
    $textureIndex.value = -1;
    $replacementImage.value = undefined;
  });
}

export const selectReplacementTexture = async ({
  imageFile,
  textureIndex
}: {
  imageFile: File | SharedArrayBuffer;
  textureIndex: number;
}) => {
  try {
    let buffer: Uint8Array;
    let width: number;
    let height: number;
    if (imageFile instanceof SharedArrayBuffer) {
      buffer = new Uint8Array(imageFile);
      width = $textureDefs.value[textureIndex].width;
      height = $textureDefs.value[textureIndex].height;
    } else {
      const [_b, , _w, _h] = await loadRGBABuffersFromFile(imageFile);

      buffer = _b;
      width = _w;
      height = _h;
    }
    const bufferKey = globalBuffers.add(buffer);
    const result = {
      replacementImage: {
        bufferKey,
        width,
        height
      },
      textureIndex
    };
    batch(() => {
      if ($replacementImage.value?.bufferKey) {
        globalBuffers.delete($replacementImage.value.bufferKey);
      }

      $replacementImage.value = result.replacementImage;
      $textureIndex.value = result.textureIndex;
      showDialog('replace-texture');
    });
    return result;
  } catch {
    return undefined;
  }
};

// Kept for compatibility: the previous operation dispatched no handled updates.

export const updateReplacementTexture = (_payload: { imageFile: File }) =>
  undefined;

export const applyReplacedTextureImage = async (rgbaBuffer: Uint8Array) => {
  try {
    const textureIndex = $textureIndex.value;
    const translucentBuffer = rgbaBuffer;
    const opaqueBuffer = new Uint8Array(translucentBuffer.length);

    for (let i = 0; i < opaqueBuffer.length; i += 4) {
      opaqueBuffer[i] = translucentBuffer[i];
      opaqueBuffer[i + 1] = translucentBuffer[i + 1];
      opaqueBuffer[i + 2] = translucentBuffer[i + 2];
      opaqueBuffer[i + 3] = 255;
    }

    const [translucent, opaque] = await Promise.all([
      globalBuffers.add(translucentBuffer),
      globalBuffers.add(opaqueBuffer)
    ]);

    const bufferKeys = { translucent, opaque };

    replaceTextureImage({ textureIndex, bufferKeys });
    closeDialog();
  } catch {
    return undefined;
  }
};
