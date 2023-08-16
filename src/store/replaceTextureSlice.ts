import { AnyAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import dialogsSlice, { closeDialog } from './dialogsSlice';
import { AppState } from './store';
import { bufferToObjectUrl } from '@/utils/data';
import loadRGBABuffersFromFile from '@/utils/images/loadRGBABuffersFromFile';

export interface ReplaceTextureState {
  textureIndex: number;
  imageObjectUrl?: string;
}

export const initialReplaceTextureState: ReplaceTextureState = {
  textureIndex: -1,
  imageObjectUrl: undefined
};

const sliceName = 'replaceTexture';

export const selectReplacementTexture = createAsyncThunk<
  { imageObjectUrl: string; textureIndex: number },
  { imageFile: File; textureIndex: number },
  { state: AppState }
>(
  `${sliceName}/selectReplacementTexture`,
  async ({ imageFile, textureIndex }, { dispatch }) => {
    const [buffer] = await loadRGBABuffersFromFile(imageFile);
    const imageObjectUrl = await bufferToObjectUrl(buffer);

    const { actions } = dialogsSlice;
    dispatch(actions.showDialog('replace-texture'));
    return {
      imageObjectUrl,
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
      if (payload === 'replace-texture' && state.imageObjectUrl) {
        URL.revokeObjectURL(state.imageObjectUrl);
        state.textureIndex = -1;
        state.imageObjectUrl = undefined;
      }
    });

    builder.addCase(
      selectReplacementTexture.fulfilled,
      (state, { payload }) => {
        if (state.imageObjectUrl) {
          URL.revokeObjectURL(state.imageObjectUrl);
        }
        Object.assign(state, payload);
      }
    );
  }
});

export default replaceTextureSlice;
