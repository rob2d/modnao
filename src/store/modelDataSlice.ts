import { createSlice, PayloadAction, UnknownAction } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { NLUITextureDef } from '@/types/NLAbstractions';
import { WorkerEvent } from '@/worker';
import exportTextureFile from '../utils/textures/files/exportTextureFile';
import HslValues from '@/utils/textures/HslValues';
import {
  selectHasCompressedTextures,
  selectTextureFileType,
  selectUpdatedTextureDefs
} from './selectors';
import { SourceTextureData } from '@/utils/textures/SourceTextureData';
import textureFileTypeMap, {
  TextureFileType
} from '@/utils/textures/files/textureFileTypeMap';
import { decompressLzssBuffer } from '@/utils/data';
import { ClientThread } from '@/utils/threads';
import { createAppAsyncThunk } from './storeTypings';
import textureShapesMap from '@/utils/textures/files/textureShapesMap';
import { showError } from './errorMessagesSlice';
import { ResourceAttribs } from '@/types/ResourceAttribs';
import loadCharacterPortraitsFile from './modelDataActions/loadCharacterPortraitsFile';
import { handleSelectedFiles } from './modelDataActions/handleSelectedFiles';

export const sliceName = 'modelData';
export type LoadPolygonsResult = {
  type: 'loadPolygonFile';
  result: LoadPolygonsPayload;
};

export type LoadTexturesResult = {
  type: 'loadTextureFile';
  result: LoadTexturesPayload;
};

export type AdjustTextureHslResult = {
  type: 'adjustTextureHsl';
  result: AdjustTextureHslPayload;
};

export type WorkerResponses =
  | LoadPolygonsResult
  | LoadTexturesResult
  | AdjustTextureHslResult;

export type EditedTexture = {
  width: number;
  height: number;
  bufferUrls: SourceTextureData;
  dataUrls: SourceTextureData;
  hsl: HslValues;
};

export interface LoadTexturesBasePayload {
  isLzssCompressed: boolean;
  textureFileType: TextureFileType;
  textureDefs: NLUITextureDef[];
  fileName: string;
  resourceAttribs?: ResourceAttribs;
}

export type LoadTexturesPayload = LoadTexturesBasePayload & {
  textureBufferUrl: string;
};

export type LoadPolygonsPayload =
  | {
      models: NLModel[];
      textureDefs: NLUITextureDef[];
      fileName: string;
      polygonBufferUrl: string;
      resourceAttribs?: ResourceAttribs;
    }
  | {
      models: [];
      textureDefs: NLUITextureDef[];
      fileName: undefined;
      polygonBufferUrl: undefined;
      resourceAttribs?: ResourceAttribs;
    };

export type AdjustTextureHslPayload = {
  textureIndex: number;
  bufferUrls: SourceTextureData;
  dataUrls: SourceTextureData;
  hsl: HslValues;
};

export interface ModelDataState {
  models: NLModel[];
  textureDefs: NLUITextureDef[];
  resourceAttribs: ResourceAttribs | undefined;
  /**
   * dictionary of texture index to previous buffer url stacks
   * note: should consider having only this stack and not deriving from
   * textureDefs to simplify state
   */
  textureHistory: {
    [key: number]: {
      dataUrls: SourceTextureData;
      bufferUrls: SourceTextureData;
    }[];
  };
  editedTextures: {
    [key: number]: EditedTexture;
  };
  polygonFileName?: string;
  textureFileName?: string;
  textureFileType?: TextureFileType;
  hasEditedTextures: boolean;
  isLzssCompressed: boolean;
  textureBufferUrl?: string;
  polygonBufferUrl?: string;
}

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

export const loadPolygonFile = createAppAsyncThunk(
  `modelData/loadPolygonFile`,
  async (file: File, { getState }): Promise<LoadPolygonsPayload> => {
    const { modelData } = getState();
    const buffer = await file.arrayBuffer();
    const thread = new ClientThread();

    const result = await new Promise<LoadPolygonsPayload>((resolve) => {
      const prevPolygonBufferUrl = modelData.polygonBufferUrl;
      thread.onmessage = (event: MessageEvent<LoadPolygonsResult>) => {
        resolve(event.data.result);

        if (prevPolygonBufferUrl) {
          URL.revokeObjectURL(prevPolygonBufferUrl);
        }

        thread.unallocate();
      };

      thread.postMessage({
        type: 'loadPolygonFile',
        payload: { buffer, fileName: file.name }
      } as WorkerEvent);
    });

    return result;
  }
);

export const loadTextureFile = createAppAsyncThunk(
  `${sliceName}/loadTextureFile`,
  async (
    {
      file,
      textureFileType,
      providedBuffer,
      providedTextureDefs,
      isLzssCompressed
    }: {
      file: File;
      textureFileType: TextureFileType;
      isLzssCompressed?: boolean;
      providedBuffer?: Buffer;
      providedTextureDefs?: NLUITextureDef[];
    },
    { getState, dispatch }
  ) => {
    const state = getState();

    let textureDefs: NLUITextureDef[];

    if (!textureFileTypeMap[textureFileType].polygonMapped) {
      textureDefs = providedTextureDefs || textureShapesMap[textureFileType];
      // clear polygons if texture headers aren't from poly file
      dispatch({
        type: loadPolygonFile.fulfilled.type,
        payload: {
          models: [],
          fileName: undefined,
          polygonBufferUrl: undefined,
          textureDefs
        }
      });
    } else {
      textureDefs = state.modelData.textureDefs;
    }

    let buffer = providedBuffer || new Uint8Array(await file.arrayBuffer());

    if (
      isLzssCompressed ||
      state.modelData.resourceAttribs?.hasLzssTextureFile
    ) {
      const arrayBuffer = await file.arrayBuffer();
      buffer = decompressLzssBuffer(Buffer.from(arrayBuffer));
    }

    const prevTextureBufferUrl = state.modelData.textureBufferUrl;
    const thread = new ClientThread();

    const result = await new Promise<LoadTexturesPayload>((resolve) => {
      thread.onmessage = (event: MessageEvent<LoadTexturesResult>) => {
        resolve(event.data.result);

        // deallocate existing blob
        if (prevTextureBufferUrl) {
          URL.revokeObjectURL(prevTextureBufferUrl);
        }

        thread.unallocate();
      };

      const fileName = file.name;

      thread.postMessage({
        type: 'loadTextureFile',
        payload: {
          fileName,
          textureDefs,
          buffer,
          isLzssCompressed,
          textureFileType
        }
      } as WorkerEvent);
    });

    return { ...result, textureFileType };
  }
);

export const adjustTextureHsl = createAppAsyncThunk(
  `modelData/adjustTextureHsl`,
  async (
    { textureIndex, hsl }: { textureIndex: number; hsl: HslValues },
    { getState }
  ) => {
    const state = getState();
    const textureDef = state.modelData.textureDefs[textureIndex];
    const { width, height, bufferUrls: sourceTextureData } = textureDef;
    const thread = new ClientThread();

    const result = await new Promise<AdjustTextureHslPayload>((resolve) => {
      thread.onmessage = (event: MessageEvent<AdjustTextureHslResult>) => {
        resolve(event.data.result);
        thread.unallocate();
      };

      thread.postMessage({
        type: 'adjustTextureHsl',
        payload: {
          hsl,
          textureIndex,
          sourceTextureData,
          width,
          height
        }
      } as WorkerEvent);
    });

    return result;
  }
);

export const downloadTextureFile = createAppAsyncThunk(
  `${sliceName}/downloadTextureFile`,
  async (_, { getState, dispatch }) => {
    const state = getState();
    const { textureFileName, textureBufferUrl = '' } = state.modelData;
    const textureDefs = selectUpdatedTextureDefs(state);
    const textureFileType = selectTextureFileType(state);
    const isLzssCompressed = selectHasCompressedTextures(state);

    if (!textureFileType) {
      dispatch(
        showError({
          title: 'Invalid file selected',
          message: 'No valid texture filetype was loaded.'
        })
      );
      return;
    }

    try {
      await exportTextureFile({
        textureDefs,
        textureFileName,
        textureBufferUrl,
        textureFileType,
        isLzssCompressed
      });
    } catch (error: unknown) {
      console.error(error);
      let message = '';

      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'string') {
        message = error;
      } else {
        error = 'Unknown error occurred';
      }

      const errorAction = showError({
        title: 'Error exporting texture',
        message
      });

      dispatch(errorAction);
    }
  }
);

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

    builder.addCase(handleSelectedFiles.pending, () => {
      return;
    });

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
