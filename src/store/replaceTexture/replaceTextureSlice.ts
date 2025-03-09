import { createSlice, UnknownAction } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import dialogsSlice, { closeDialog } from '../dialogs/dialogsSlice';
import { AppThunk } from '../store';
import loadRGBABuffersFromFile from '@/utils/images/loadRGBABuffersFromFile';
import { replaceTextureImage } from '../modelData';
import { createAppAsyncThunk } from '../storeTypings';
import { ReplaceTextureState } from './replaceTextureTypes';
import globalBuffers from '@/utils/data/globalBuffers';

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
    const [buffer, , width, height] = await loadRGBABuffersFromFile(imageFile);
    const bufferObjectUrl = globalBuffers.add(buffer);

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
  async (rgbaBuffer: Uint8Array, { getState, dispatch }) => {
    const state = getState();
    const { textureIndex } = state.replaceTexture;
    const translucentBuffer = rgbaBuffer;
    const opaqueBuffer = new Uint8Array(translucentBuffer.length);

    for (let i = 0; i < opaqueBuffer.length; i += 4) {
      // for opaque buffer, set all pixels to 255 alpha
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

    dispatch(
      replaceTextureImage({
        textureIndex,
        bufferKeys
      })
    );

    dispatch(closeDialog());
  }
);

const replaceTextureSlice = createSlice({
  name: sliceName,
  initialState: initialReplaceTextureState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(HYDRATE, (state, { payload }: UnknownAction) =>
      Object.assign(state, payload)
    );

    builder.addCase(closeDialog, (state, { payload }) => {
      if (
        payload === 'replace-texture' &&
        state.replacementImage?.bufferObjectUrl
      ) {
        // URL.revokeObjectURL(state.replacementImage?.bufferObjectUrl);
        state.textureIndex = -1;
        state.replacementImage = undefined;
      }
    });

    builder.addCase(
      selectReplacementTexture.fulfilled,
      (state, { payload }) => {
        if (state.replacementImage?.bufferObjectUrl) {
          // URL.revokeObjectURL(state.replacementImage?.bufferObjectUrl);
        }
        Object.assign(state, payload);
      }
    );
  }
});

export default replaceTextureSlice;
