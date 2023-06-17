import { AnyAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import processPolygonBuffer from './stage-data/processPolygonBuffer';
import processTextureBuffer from './stage-data/processTextureBuffer';
import exportTextureFile from './stage-data/exportTextureFile';
import { AppState } from './store';
import { NLTextureDef, TextureDataUrlType } from '@/types/NLAbstractions';
import getImageDimensions from '@/utils/images/getImageDimensions';
import { decompressTextureBuffer } from '@/utils/textures/parse';
import nonSerializables from './nonSerializables';
import processTextureHsl from '@/utils/textures/adjustTextureHsl';
import HslValues from '@/utils/textures/HslValues';
import { selectSceneTextureDefs } from './selectors';
import storeSourceTextureData from './stage-data/storeSourceTextureData';

export interface StageDataState {
  models: NLModel[];
  textureDefs: NLTextureDef[];
  editedTextures: {
    [key: number]: {
      opaque: string;
      translucent: string;
      hsl: HslValues;
    };
  };
  polygonFileName?: string;
  textureFileName?: string;
  hasEditedTextures: boolean;
}

const sliceName = 'modelData';

export const initialStageDataState: StageDataState = {
  models: [],
  textureDefs: [],
  editedTextures: {},
  polygonFileName: undefined,
  textureFileName: undefined,
  hasEditedTextures: false
};

export const loadPolygonFile = createAsyncThunk<
  { models: NLModel[]; textureDefs: NLTextureDef[]; fileName: string },
  File
>(`${sliceName}/loadPolygonFile`, async (file: File) => {
  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await processPolygonBuffer(buffer);
  nonSerializables.polygonBuffer = buffer;

  return {
    ...result,
    fileName: file.name
  };
});

export const adjustTextureHsl = createAsyncThunk<
  {
    textureIndex: number;
    hsl: HslValues;
    textureDataUrls: { translucent: string; opaque: string };
  },
  { textureIndex: number; hsl: HslValues }
>(`${sliceName}/adjustTextureHsl`, async ({ textureIndex, hsl }) => {
  const sourceTextureData = nonSerializables.sourceTextureData[textureIndex];

  try {
    const [opaque, translucent] = await Promise.all([
      processTextureHsl(sourceTextureData.opaque, hsl),
      processTextureHsl(sourceTextureData.translucent, hsl)
    ]);

    return {
      textureIndex,
      hsl,
      textureDataUrls: { translucent, opaque }
    };
  } catch (error) {
    console.error(error);
    return {
      textureIndex,
      hsl,
      textureDataUrls: { translucent: '', opaque: '' }
    };
  }
});

export const loadTextureFile = createAsyncThunk<
  {
    models: NLModel[];
    textureDefs: NLTextureDef[];
    fileName?: string;
  },
  File,
  { state: AppState }
>(`${sliceName}/loadTextureFile`, async (file, { getState }) => {
  const state = getState();
  const { models, textureDefs } = state.modelData;

  const fileName = file.name;

  // if no polygon loaded, resolve entry data
  if (!state.modelData.polygonFileName) {
    return Promise.resolve({ models, textureDefs, fileName: undefined });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let result: {
    models: NLModel[];
    textureDefs: NLTextureDef[];
    fileName: string;
  };

  try {
    result = {
      ...(await processTextureBuffer(buffer, models, textureDefs)),
      fileName
    };
  } catch (error) {
    // if an overflow error occurs, this is an indicator that the
    // file loaded is compressed; this is common for certain
    // game texture formats like Capcom vs SNK 2

    if (!(error instanceof RangeError)) {
      throw error;
    }

    const decompressedBuffer = await decompressTextureBuffer(buffer);
    result = {
      ...(await processTextureBuffer(decompressedBuffer, models, textureDefs)),
      fileName
    };
  }

  nonSerializables.textureBuffer = buffer;
  return result;
});

export const replaceTextureDataUrl = createAsyncThunk<
  { textureIndex: number; dataUrl: string },
  { textureIndex: number; dataUrl: string },
  { state: AppState }
>(
  `${sliceName}/replaceTextureDataUrl`,
  async ({ textureIndex, dataUrl }, { getState }) => {
    const state = getState();
    const { textureDefs } = state.modelData;
    const def = textureDefs[textureIndex];

    const [width, height] = await getImageDimensions(dataUrl);

    if (width !== def.width || height !== def.height) {
      throw new Error(
        `size of texture must match the original (${width} x ${height})}`
      );
    }

    // @TODO process both opaque and non-opaque textures
    // and then update state for both in action

    await storeSourceTextureData(dataUrl, textureIndex);

    return { textureIndex, dataUrl };
  }
);

export const downloadTextureFile = createAsyncThunk<
  void,
  void,
  { state: AppState }
>(`${sliceName}/downloadTextureFile`, async (_, { getState }) => {
  const state = getState();
  const { textureFileName } = state.modelData;
  const textureDefs = selectSceneTextureDefs(state);
  await exportTextureFile(textureDefs, textureFileName);
});

const modelDataSlice = createSlice({
  name: sliceName,
  initialState: initialStageDataState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      loadPolygonFile.fulfilled,
      (
        state: StageDataState,
        { payload: { models, textureDefs, fileName } }
      ) => {
        state.models = models;
        state.textureDefs = textureDefs;
        state.editedTextures = [];
        state.polygonFileName = fileName;
        state.textureFileName = undefined;
      }
    );

    builder.addCase(
      loadTextureFile.fulfilled,
      (
        state: StageDataState,
        { payload: { models, textureDefs, fileName } }
      ) => {
        state.models = models;
        state.textureDefs = textureDefs;
        state.editedTextures = [];
        state.textureFileName = fileName;
      }
    );

    builder.addCase(
      replaceTextureDataUrl.fulfilled,
      (state: StageDataState, { payload: { textureIndex, dataUrl } }) => {
        const dataUrlTypes = Object.keys(
          state.textureDefs[textureIndex].dataUrls
        ) as TextureDataUrlType[];

        dataUrlTypes.forEach((key) => {
          state.textureDefs[textureIndex].dataUrls[key] = dataUrl;
        });

        // remove existing edited textures since these
        // take precedence on rendering scenes

        if (state.editedTextures[textureIndex]) {
          const filteredEntries = Object.entries(state.editedTextures).filter(
            ([i]) => Number(i) !== textureIndex
          );

          state.editedTextures = Object.fromEntries(filteredEntries);
        }

        state.hasEditedTextures = true;
      }
    );

    builder.addCase(
      adjustTextureHsl.fulfilled,
      (
        state: StageDataState,
        { payload: { textureIndex, textureDataUrls, hsl } }
      ) => {
        if (hsl.h != 0 || hsl.s != 0 || hsl.l != 0) {
          state.editedTextures[textureIndex] = {
            ...textureDataUrls,
            hsl
          };
        } else {
          const entries = Object.entries(state.editedTextures).filter(
            ([k]) => Number(k) !== textureIndex
          );

          state.editedTextures = Object.fromEntries(entries);
        }
        state.hasEditedTextures = Object.keys(state.editedTextures).length > 0;
      }
    );

    builder.addCase(HYDRATE, (state, { payload }: AnyAction) =>
      Object.assign(state, payload)
    );
  }
});

export default modelDataSlice;
