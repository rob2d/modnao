import { createSlice, PayloadAction, UnknownAction } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { SourceTextureData } from '@/utils/textures/SourceTextureData';
import { ModelDataState } from './modelDataTypes';
import {
  adjustTextureHsl,
  loadCharacterPortraitsFile,
  loadPolygonFile,
  loadTextureFile
} from './modelDataThunks';

const sliceName = 'modelData';

export const initialModelDataState: ModelDataState = {
  models: [],
  textureDefs: [],
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
  name: sliceName,
  initialState: initialModelDataState,
  reducers: {
    replaceTextureImage(
      state,
      {
        payload: { textureIndex, bufferUrls, dataUrls }
      }: PayloadAction<{
        textureIndex: number;
        bufferUrls: SourceTextureData;
        dataUrls: SourceTextureData;
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
        bufferUrls: state.textureDefs[textureIndex]
          .bufferUrls as SourceTextureData,
        dataUrls: state.textureDefs[textureIndex].dataUrls as SourceTextureData
      });

      state.textureDefs[textureIndex].bufferUrls = bufferUrls;
      state.textureDefs[textureIndex].dataUrls = dataUrls;
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
        state.textureDefs[textureIndex].bufferUrls.translucent =
          textureHistory.bufferUrls.translucent;
        state.textureDefs[textureIndex].bufferUrls.opaque =
          textureHistory.bufferUrls.opaque;

        state.textureDefs[textureIndex].dataUrls.translucent =
          textureHistory.dataUrls.translucent;
        state.textureDefs[textureIndex].dataUrls.opaque =
          textureHistory.dataUrls.opaque;
      }

      return state;
    }
  },
  extraReducers: (builder) => {
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

        state.textureDefs = textureDefs;
        state.editedTextures = {};
        state.hasEditedTextures = false;
        state.textureHistory = {};
        state.textureFileType = textureFileType;

        state.textureFileName = fileName;
        state.isLzssCompressed = isLzssCompressed;
        state.textureBufferUrl = textureBufferUrl;
      }
    );

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
        { payload: { textureIndex, bufferUrls, dataUrls, hsl } }
      ) => {
        const { width, height } = state.textureDefs[textureIndex];
        if (hsl.h != 0 || hsl.s != 0 || hsl.l != 0) {
          state.editedTextures[textureIndex] = {
            width,
            height,
            bufferUrls,
            dataUrls,
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
