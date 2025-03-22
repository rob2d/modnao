import { createSlice, PayloadAction, UnknownAction } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { TextureImageBufferKeys } from '@/utils/textures/TextureImageBufferKeys';
import { LoadTexturesResultPayload, ModelDataState } from './modelDataTypes';
import {
  loadCharacterPortraitsFile,
  processAdjustedTextureHsl,
  processPolygonFile,
  processTextureFile
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
      // clear previous edited texture when replacing a texture image
      delete state.editedTextures[textureIndex];

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
      }

      delete state.editedTextures[textureIndex];

      const textureHistory = state.textureHistory[textureIndex].pop();

      if (textureHistory) {
        state.textureDefs[textureIndex].bufferKeys.translucent =
          textureHistory.bufferKeys.translucent;
        state.textureDefs[textureIndex].bufferKeys.opaque =
          textureHistory.bufferKeys.opaque;
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(processPolygonFile.pending, (state: ModelDataState) => {
      state.loadTexturesState = 'idle';
    });
    builder.addCase(processTextureFile.pending, (state: ModelDataState) => {
      state.loadTexturesState = 'pending';
    });
    builder.addCase(
      processPolygonFile.fulfilled,
      (
        state: ModelDataState,
        {
          payload: {
            models,
            textureDefs,
            fileName,
            polygonBufferKey,
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
        state.polygonBufferKey = polygonBufferKey;
        state.hasEditedTextures = false;
      }
    );

    builder.addCase(
      processTextureFile.fulfilled,
      (
        state: ModelDataState,
        { payload }: PayloadAction<LoadTexturesResultPayload>
      ) => {
        const {
          textureDefs,
          fileName,
          isLzssCompressed,
          textureBufferKey,
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
        state.textureBufferKey = textureBufferKey;
      }
    );

    builder.addCase(processTextureFile.rejected, (state: ModelDataState) => {
      state.loadTexturesState = 'rejected';
    });

    builder.addCase(
      loadCharacterPortraitsFile.pending,
      (state: ModelDataState) => {
        state.polygonBufferKey = undefined;
        state.textureBufferKey = undefined;
        state.textureDefs = [];
        state.textureHistory = {};
      }
    );

    builder.addCase(
      processAdjustedTextureHsl.fulfilled,
      (
        state: ModelDataState,
        { payload: { textureIndex, bufferKeys, hsl } }
      ) => {
        const { width, height } = state.textureDefs[textureIndex];
        state.editedTextures[textureIndex] = {
          width,
          height,
          bufferKeys,
          hsl
        };
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
