import { createSlice, PayloadAction, UnknownAction } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { TextureImageBufferKeys } from '@/utils/textures/TextureImageBufferKeys';
import { ModelDataState } from './modelDataTypes';
import {
  adjustTextureHsl,
  loadCharacterPortraitsFile,
  loadPolygonFile,
  loadTextureFile
} from './modelDataThunks';

export const initialModelDataState: ModelDataState = {
  models: [],
  textureDefs: [],
  loadTexturesState: 'idle',
  editedTextures: {},
  textureHistory: {},
  polygonFileName: undefined,
  textureFileName: undefined,
  textureFileType: undefined,
  resourceAttribs: undefined,
  hasEditedTextures: false,
  isLzssCompressed: false
};

const modelDataSlice = createSlice({
  name: 'modelData',
  initialState: initialModelDataState,
  reducers: {
    replaceTextureImage(
      state,
      {
        payload: { textureIndex, bufferKeys }
      }: PayloadAction<{
        textureIndex: number;
        bufferKeys: TextureImageBufferKeys;
      }>
    ) {
      // @TODO: for better UX, re-apply existing HSL on new image automagically
      // in thunk that led to this fulfilled action
      // clear previous edited texture when replacing a texture image
      if (state.editedTextures[textureIndex]) {
        state.editedTextures = Object.fromEntries(
          Object.entries(state.editedTextures).filter(
            ([k]) => Number(k) !== textureIndex
          )
        );
      }

      state.textureHistory[textureIndex] =
        state.textureHistory[textureIndex] || [];
      state.textureHistory[textureIndex].push({
        bufferKeys: state.textureDefs[textureIndex]
          .bufferKeys as TextureImageBufferKeys
      });

      state.textureDefs[textureIndex].bufferKeys = bufferKeys;
      state.hasEditedTextures = true;
    },
    revertTextureImage(
      state,
      { payload: { textureIndex } }: PayloadAction<{ textureIndex: number }>
    ) {
      // only valid if there's an actual texture to revert to
      if (state.textureHistory[textureIndex].length === 0) {
        return state;
      }

      // remove editedTexture state in case of hsl changes
      state.editedTextures = Object.fromEntries(
        Object.entries(state.editedTextures).filter(
          ([k]) => k !== textureIndex.toString()
        )
      );

      const textureHistory = state.textureHistory[textureIndex].pop();

      if (textureHistory) {
        state.textureDefs[textureIndex].bufferKeys.translucent =
          textureHistory.bufferKeys.translucent;
        state.textureDefs[textureIndex].bufferKeys.opaque =
          textureHistory.bufferKeys.opaque;
      }

      return state;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(loadPolygonFile.pending, (state: ModelDataState) => {
      state.loadTexturesState = 'idle';
    });
    builder.addCase(loadTextureFile.pending, (state: ModelDataState) => {
      state.loadTexturesState = 'pending';
    });
    builder.addCase(
      loadPolygonFile.fulfilled,
      (
        state: ModelDataState,
        {
          payload: {
            models,
            textureDefs,
            fileName,
            polygonBufferUrl,
            resourceAttribs
          }
        }
      ) => {
        state.models = models;
        state.textureDefs = textureDefs;
        state.resourceAttribs = resourceAttribs;
        state.editedTextures = {};
        state.textureHistory = {};
        state.textureFileType = undefined;

        state.polygonFileName = fileName;
        state.textureFileName = undefined;
        state.polygonBufferUrl = polygonBufferUrl;
        state.hasEditedTextures = false;
      }
    );

    builder.addCase(
      loadTextureFile.fulfilled,
      (state: ModelDataState, { payload }) => {
        const {
          textureDefs,
          fileName,
          isLzssCompressed,
          textureBufferUrl,
          textureFileType
        } = payload;

        state.loadTexturesState = 'fulfilled';
        state.textureDefs = textureDefs;
        state.editedTextures = {};
        state.hasEditedTextures = false;
        state.textureHistory = {};
        state.textureFileType = textureFileType;

        state.textureFileName = fileName;
        state.isLzssCompressed = Boolean(isLzssCompressed);
        state.textureBufferUrl = textureBufferUrl;
        state.textureBufferUrl = textureBufferUrl;
      }
    );

    builder.addCase(loadTextureFile.rejected, (state: ModelDataState) => {
      state.loadTexturesState = 'rejected';
    });

    builder.addCase(
      loadCharacterPortraitsFile.pending,
      (state: ModelDataState) => {
        state.polygonBufferUrl = undefined;
        state.textureBufferUrl = undefined;
        state.textureDefs = [];
        state.textureHistory = {};
      }
    );

    builder.addCase(
      adjustTextureHsl.fulfilled,
      (
        state: ModelDataState,
        { payload: { textureIndex, bufferKeys, hsl } }
      ) => {
        const { width, height } = state.textureDefs[textureIndex];
        if (hsl.h != 0 || hsl.s != 0 || hsl.l != 0) {
          state.editedTextures[textureIndex] = {
            width,
            height,
            bufferKeys,
            hsl
          };
        } else {
          const entries = Object.entries(state.editedTextures).filter(
            ([k]) => Number(k) !== textureIndex
          );

          state.editedTextures = Object.fromEntries(entries);
        }
        state.hasEditedTextures =
          state.hasEditedTextures ||
          Object.keys(state.editedTextures).length > 0;
      }
    );

    builder.addCase(HYDRATE, (state, { payload }: UnknownAction) =>
      Object.assign(state, payload)
    );
  }
});

export const { revertTextureImage, replaceTextureImage } =
  modelDataSlice.actions;

export default modelDataSlice;
