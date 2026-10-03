import { closeDialog, showDialog } from '@/modules/dialogs/dialogsStore';
import { replaceTextureImage } from '@/modules/model-data/modelDataStore';
import { getState } from '@/store';
import globalBuffers from '@/utils/data/globalBuffers';
import loadRGBABuffersFromFile from '@/utils/images/loadRGBABuffersFromFile';
import { batch, signal } from '@preact-signals/safe-react';
import { produce } from 'immer';
import { ReplaceTextureState } from './replaceTextureTypes';

export const initialReplaceTextureState: ReplaceTextureState = {
  textureIndex: -1,
  replacementImage: undefined
};

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
      const state = getState();
      width = state.modelData.textureDefs[textureIndex].width;
      height = state.modelData.textureDefs[textureIndex].height;
    } else {
      const [_b, , _w, _h] = await loadRGBABuffersFromFile(imageFile);

      buffer = _b;
      width = _w;
      height = _h;
    }
    const bufferKey = globalBuffers.add(buffer);
    showDialog('replace-texture');
    const result = {
      replacementImage: {
        bufferKey,
        width,
        height
      },
      textureIndex
    };
    batch(() => {
      $replaceTexture.value = produce($replaceTexture.value, (state) => {
        const payload = result;
        if (state.replacementImage?.bufferKey) {
          globalBuffers.delete(state.replacementImage.bufferKey);
        }
        Object.assign(state, payload);
      });
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
    const state = getState();
    const { textureIndex } = state.replaceTexture;
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

export const $replaceTexture = signal<ReplaceTextureState>(
  initialReplaceTextureState
);
