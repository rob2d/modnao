import { decodeTga } from '@lunapaint/tga-codec';
import { Image } from 'image-js';
import { AnyAction, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import dialogsSlice, { closeDialog } from './dialogsSlice';
import { AppThunk } from './store';
import { bufferToObjectUrl } from '@/utils/data';
import loadRGBABuffersFromFile from '@/utils/images/loadRGBABuffersFromFile';
import { replaceTextureImage } from './modelDataSlice';
import { batch } from 'react-redux';
import { createAppAsyncThunk } from './storeTypings';

export type ReplacementImage = {
  bufferObjectUrl: string;
  width: number;
  height: number;
};

export interface ReplaceTextureState {
  textureIndex: number;
  replacementImage?: ReplacementImage;
}

export const initialReplaceTextureState: ReplaceTextureState = {
  textureIndex: -1,
  replacementImage: undefined
};

const sliceName = 'replaceTexture';

export const selectReplacementTexture = createAppAsyncThunk(
  `${sliceName}/selectReplacementTexture`,
  async (
    { imageFile, textureIndex }: { imageFile: File; textureIndex: number },
    { dispatch }
  ) => {
    let replacementImage: ReplacementImage;

    switch (imageFile.type) {
      case '':
      case 'image/tga': {
        const data = await imageFile.arrayBuffer();
        const decodedTga = await decodeTga(Buffer.from(data));
        if (!decodedTga) {
          throw Error('Unknown error occurred');
        }

        replacementImage = {
          width: decodedTga.image.width,
          height: decodedTga.image.height,
          bufferObjectUrl: await bufferToObjectUrl(decodedTga.image.data)
        };
        break;
      }
      default: {
        const [buffer, , width, height] =
          await loadRGBABuffersFromFile(imageFile);
        const bufferObjectUrl = await bufferToObjectUrl(buffer);
        replacementImage = {
          width,
          height,
          bufferObjectUrl
        };
        break;
      }
    }

    const { actions } = dialogsSlice;
    dispatch(actions.showDialog('replace-texture'));
    return {
      replacementImage,
      textureIndex
    };
  }
);

export const updateReplacementTexture =
  ({ imageFile }: { imageFile: File }): AppThunk =>
  (dispatch, getState) => {
    const { textureIndex } = getState().replaceTexture;
    dispatch({
      type: selectReplacementTexture.pending.type,
      payload: { textureIndex, imageFile }
    });

    dispatch({
      type: `${sliceName}/updateReplacementTexture`,
      payload: { imageFile }
    });
  };

export const applyReplacedTextureImage = createAppAsyncThunk(
  `${sliceName}/applyReplacedTextureImage`,
  async (
    rgbaBuffer: Uint8Array | Uint8ClampedArray,
    { getState, dispatch }
  ) => {
    const state = getState();
    const { textureIndex } = state.replaceTexture;
    const { width, height } = state.modelData.textureDefs[textureIndex];
    const translucentBuffer = rgbaBuffer;
    const opaqueBuffer = new Uint8ClampedArray(translucentBuffer.length);

    for (let i = 0; i < opaqueBuffer.length; i += 4) {
      // for opaque buffer, set all pixels to 255 alpha
      opaqueBuffer[i] = translucentBuffer[i];
      opaqueBuffer[i + 1] = translucentBuffer[i + 1];
      opaqueBuffer[i + 2] = translucentBuffer[i + 2];
      opaqueBuffer[i + 3] = 255;
    }

    const [translucent, opaque] = await Promise.all([
      bufferToObjectUrl(translucentBuffer),
      bufferToObjectUrl(opaqueBuffer)
    ]);

    const bufferUrls = { translucent, opaque };

    batch(() => {
      dispatch(
        replaceTextureImage({
          textureIndex,
          bufferUrls,
          dataUrls: {
            translucent: new Image({
              data: translucentBuffer,
              width,
              height
            }).toDataURL(),
            opaque: new Image({
              data: opaqueBuffer,
              width,
              height
            }).toDataURL()
          }
        })
      );

      dispatch(closeDialog());
    });
  }
);

const replaceTextureSlice = createSlice({
  name: sliceName,
  initialState: initialReplaceTextureState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(HYDRATE, (state, { payload }: AnyAction) =>
      Object.assign(state, payload)
    );

    builder.addCase(closeDialog, (state, { payload }) => {
      if (
        payload === 'replace-texture' &&
        state.replacementImage?.bufferObjectUrl
      ) {
        URL.revokeObjectURL(state.replacementImage?.bufferObjectUrl);
        state.textureIndex = -1;
        state.replacementImage = undefined;
      }
    });

    builder.addCase(
      selectReplacementTexture.fulfilled,
      (state, { payload }) => {
        if (state.replacementImage?.bufferObjectUrl) {
          URL.revokeObjectURL(state.replacementImage?.bufferObjectUrl);
        }
        Object.assign(state, payload);
      }
    );
  }
});

export default replaceTextureSlice;
