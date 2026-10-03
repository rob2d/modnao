import { closeDialog, showDialog } from '@/modules/dialogs/dialogsStore';
import {
  $textureDefs,
  replaceTextureImage
} from '@/modules/model-data/modelDataStore';
import globalBuffers from '@/utils/data/globalBuffers';
import loadRGBABuffersFromFile from '@/utils/images/loadRGBABuffersFromFile';
import { batch, observable } from '@legendapp/state';
import type { ReplacementImage } from './replaceTextureTypes';

export const $textureIndex = observable(-1);
export const $replacementImage = observable<ReplacementImage | undefined>(
  undefined
);

export function resetReplaceTexture() {
  batch(() => {
    $textureIndex.set(-1);
    $replacementImage.set(undefined);
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
      width = $textureDefs.get()[textureIndex].width;
      height = $textureDefs.get()[textureIndex].height;
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
      if ($replacementImage.get()?.bufferKey) {
        globalBuffers.delete($replacementImage.get()!.bufferKey);
      }

      $replacementImage.set(result.replacementImage);
      $textureIndex.set(result.textureIndex);
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
    const textureIndex = $textureIndex.get();
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
