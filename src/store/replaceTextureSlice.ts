import { AnyAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import dialogsSlice, { closeDialog } from './dialogsSlice';
import { AppState } from './store';
import { bufferToObjectUrl } from '@/utils/data';
import loadRGBABuffersFromFile from '@/utils/images/loadRGBABuffersFromFile';

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
