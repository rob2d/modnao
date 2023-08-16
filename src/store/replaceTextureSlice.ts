import { Image } from 'image-js';
import { AnyAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import dialogsSlice, { closeDialog } from './dialogsSlice';
import { AppState } from './store';
import { bufferToObjectUrl, objectUrlToBuffer } from '@/utils/data';
import loadRGBABuffersFromFile from '@/utils/images/loadRGBABuffersFromFile';
import { replaceTextureImage } from './modelDataSlice';
import { batch } from 'react-redux';

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

export const selectReplacementTexture = createAsyncThunk<
  { replacementImage: ReplacementImage; textureIndex: number },
  { imageFile: File; textureIndex: number },
  { state: AppState }
>(
  `${sliceName}/selectReplacementTexture`,
  async ({ imageFile, textureIndex }, { dispatch }) => {
    const [buffer, _, width, height] = await loadRGBABuffersFromFile(imageFile);
    const bufferObjectUrl = await bufferToObjectUrl(buffer);

    const { actions } = dialogsSlice;
    dispatch(actions.showDialog('replace-texture'));
    return {
      replacementImage: {
        bufferObjectUrl,
        width,
        height
      },
      textureIndex
    };
  }
);

export const applyReplacedTextureImage = createAsyncThunk<
  void,
  string,
  { state: AppState }
>(
  `${sliceName}/applyReplacedTextureImage`,
  async (imageSrc, { getState, dispatch }) => {
    const state = getState();
    const { textureIndex } = state.replaceTexture;
    const { width, height } = state.modelData.textureDefs[textureIndex];
    const translucentBuffer = (await Image.load(imageSrc)).getRGBAData();
    const opaqueBuffer = translucentBuffer.copyWithin(0);
    const textureDef = state.modelData.textureDefs[textureIndex];
    const oTranslucentBuffer = new Uint8ClampedArray(
      await objectUrlToBuffer(textureDef.bufferUrls.translucent || '')
    );

    for (let i = 0; i < oTranslucentBuffer.length; i += 4) {
      // restore original RGBA values on translucent for special cases
      // where alpha was zero

      if (oTranslucentBuffer[i + 3] === 0) {
        translucentBuffer[i + 3] = 0;
      }

      // for opaque buffer, set all pixels to 255 alpha
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
