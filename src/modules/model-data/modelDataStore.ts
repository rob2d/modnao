import { getTextureHslScopeKey } from './modelDataUtils';
import resourceAttribMappings from '@/constants/resourceAttribMappings';
import { showError } from '@/modules/error-messages';
import {
  $modelIndex,
  $selectedObjectIds,
  $textureIndex
} from '@/modules/object-viewer/objectViewerStore';
import {
  adjustNormalizedColorHsl,
  hexToNormalizedColor
} from '@/utils/color-conversions';
import globalBuffers from '@/utils/data/globalBuffers';
import { decompressLzssBuffer, sharedBufferFrom } from '@/utils/data';
import { type HslValues, type TextureImageBufferKeys } from '@/utils/textures';
import { ClientThread } from '@/utils/threads';
import type {
  AdjustTextureHslWorkerPayload,
  AdjustTextureHslWorkerResult
} from '@/workers/adjustTextureHslWorker';
import type {
  LoadPolygonFileWorkerPayload,
  LoadPolygonFileWorkerResult
} from '@/workers/loadPolygonFileWorker';
import type {
  LoadTextureFileWorkerPayload,
  LoadTextureFileWorkerResult
} from '@/workers/loadTextureFileWorker';
import writeVertexColorToBuffer from '@/utils/polygons/writeVertexColorToBuffer';
import type {
  AsyncState,
  NLUITextureDef,
  ResourceAttribs,
  TextureDataUrlType,
  TextureFileType
} from '@/types';
import { batch, observable } from '@legendapp/state';
import saveAs from 'file-saver';
import { produce } from 'immer';
import {
  ApplySelectedVertexColorResult,
  ApplySelectedVertexHslPayload,
  LoadTexturesPayload,
  ModelDataPatchTextureUpdate,
  ModelDataState,
  TextureHslSession
} from './modelDataTypes';

interface TextureHslAdjustmentPayload {
  textureIndex: number;
  hsl: HslValues;
  sourceBufferKeys?: TextureImageBufferKeys;
  uvPixelByteIndexes?: number[];
}

const imgTypes = ['opaque', 'translucent'] as TextureDataUrlType[];

export const $models = observable<NLModel[]>([]);
export const $originalModels = observable<NLModel[]>([]);
export const $textureDefs = observable<NLUITextureDef[]>([]);
export const $resourceAttribs = observable<ResourceAttribs | undefined>(
  undefined
);

export const $textureHistory = observable<ModelDataState['textureHistory']>({});
export const $editedTextures = observable<ModelDataState['editedTextures']>({});
export const $textureHslSessions = observable<
  ModelDataState['textureHslSessions']
>({});

export const $polygonFileName = observable<string | undefined>(undefined);
export const $textureFileName = observable<string | undefined>(undefined);
export const $textureFileType = observable<TextureFileType | undefined>(
  undefined
);

export const $hasEditedTextures = observable(false);
export const $isLzssCompressed = observable(false);

export const $textureBufferKey = observable<string | undefined>(undefined);
export const $polygonBufferKey = observable<string | undefined>(undefined);

export const $loadTexturesState = observable<AsyncState>('idle');
export const $exportTextureFileState = observable<AsyncState>('idle');

export function resetModelData(
  preloadedState: ModelDataState = {
    models: [],
    originalModels: [],
    textureDefs: [],
    resourceAttribs: undefined,
    textureHistory: {},
    editedTextures: {},
    textureHslSessions: {},
    polygonFileName: undefined,
    textureFileName: undefined,
    textureFileType: undefined,
    hasEditedTextures: false,
    isLzssCompressed: false,
    textureBufferKey: undefined,
    polygonBufferKey: undefined,
    loadTexturesState: 'idle',
    exportTextureFileState: 'idle'
  }
) {
  batch(() => {
    $models.set(preloadedState.models);
    $originalModels.set(preloadedState.originalModels);
    $textureDefs.set(preloadedState.textureDefs);
    $resourceAttribs.set(preloadedState.resourceAttribs);
    $textureHistory.set(preloadedState.textureHistory);
    $editedTextures.set(preloadedState.editedTextures);
    $textureHslSessions.set(preloadedState.textureHslSessions);
    $polygonFileName.set(preloadedState.polygonFileName);
    $textureFileName.set(preloadedState.textureFileName);
    $textureFileType.set(preloadedState.textureFileType);
    $hasEditedTextures.set(preloadedState.hasEditedTextures);
    $isLzssCompressed.set(preloadedState.isLzssCompressed);
    $textureBufferKey.set(preloadedState.textureBufferKey);
    $polygonBufferKey.set(preloadedState.polygonBufferKey);
    $loadTexturesState.set(preloadedState.loadTexturesState);
    $exportTextureFileState.set(preloadedState.exportTextureFileState);
  });
}

export const applySelectedVertexColorFulfilled = (
  models: NLModel[],
  {
    payload: { modelIndex, vertexColorUpdates }
  }: { payload: ApplySelectedVertexColorResult }
) => {
  const model = models[modelIndex];

  if (!model || vertexColorUpdates.length === 0) {
    return;
  }

  const vertexColorUpdatesByAddress = new Map(
    vertexColorUpdates.map(({ contentAddress, color }) => [
      contentAddress,
      color
    ])
  );

  model.meshes.forEach((mesh) => {
    if (!mesh.hasColoredVertices) {
      return;
    }

    mesh.polygons.forEach((polygon) => {
      polygon.vertices.forEach((vertex) => {
        const color = vertexColorUpdatesByAddress.get(vertex.contentAddress);

        if (!color) {
          return;
        }

        vertex.colors = color;
      });
    });
  });
};

export const applySelectedVertexColor = ({
  hexColor
}: {
  hexColor: string;
}) => {
  try {
    const modelIndex = $modelIndex.get();
    const selectedIds = $selectedObjectIds.get();
    const model = $models.get()[modelIndex];
    const color = hexToNormalizedColor(hexColor);

    if (!model || !color) {
      const result = { modelIndex, vertexColorUpdates: [] };
      $models.set(
        produce($models.get(), (models) => {
          applySelectedVertexColorFulfilled(models, { payload: result });
        })
      );
      return result;
    }

    const vertexColorUpdatesByAddress = new Map<number, NLColorRGBA>();

    Object.keys(selectedIds).forEach((objectKey) => {
      if (!selectedIds[objectKey]) {
        return;
      }

      const indexes = objectKey.split('_').map(Number);

      if (indexes.length !== 3 || !indexes.every(Number.isInteger)) {
        return;
      }

      const [meshIndex, polygonIndex, vertexIndex] = indexes;
      const mesh = model.meshes[meshIndex];

      if (!mesh?.hasColoredVertices) {
        return;
      }

      const vertex = mesh.polygons[polygonIndex]?.vertices[vertexIndex];

      if (!vertex) {
        return;
      }

      vertexColorUpdatesByAddress.set(vertex.contentAddress, [
        color[0],
        color[1],
        color[2],
        vertex.colors?.[3] ?? 1
      ]);
    });

    const polygonBufferKey = $polygonBufferKey.get();

    if (polygonBufferKey) {
      const polygonBuffer = globalBuffers.get(polygonBufferKey);

      vertexColorUpdatesByAddress.forEach((vertexColor, contentAddress) => {
        writeVertexColorToBuffer(polygonBuffer, contentAddress, vertexColor);
      });
    }

    const result = {
      modelIndex,
      vertexColorUpdates: Array.from(
        vertexColorUpdatesByAddress.entries(),
        ([contentAddress, vertexColor]) => ({
          contentAddress,
          color: vertexColor
        })
      )
    };
    $models.set(
      produce($models.get(), (models) => {
        applySelectedVertexColorFulfilled(models, { payload: result });
      })
    );
    return result;
  } catch {
    return undefined;
  }
};

export const applySelectedVertexHsl = ({
  baseVertexColors,
  hsl
}: ApplySelectedVertexHslPayload) => {
  try {
    const modelIndex = $modelIndex.get();
    const vertexColorUpdates = baseVertexColors.map(
      ({ contentAddress, color }) => ({
        contentAddress,
        color: adjustNormalizedColorHsl(color, hsl)
      })
    );
    const polygonBufferKey = $polygonBufferKey.get();

    if (polygonBufferKey) {
      const polygonBuffer = globalBuffers.get(polygonBufferKey);

      vertexColorUpdates.forEach(({ contentAddress, color }) => {
        writeVertexColorToBuffer(polygonBuffer, contentAddress, color);
      });
    }

    const result = {
      modelIndex,
      vertexColorUpdates
    };
    $models.set(
      produce($models.get(), (models) => {
        applySelectedVertexColorFulfilled(models, { payload: result });
      })
    );
    return result;
  } catch {
    return undefined;
  }
};

export function replaceTextureImage({
  textureIndex,
  bufferKeys
}: ModelDataPatchTextureUpdate) {
  batch(() => {
    $editedTextures.set(
      produce($editedTextures.get(), (editedTextures) => {
        delete editedTextures[textureIndex];
      })
    );
    $textureHslSessions.set(
      produce($textureHslSessions.get(), (textureHslSessions) => {
        delete textureHslSessions[textureIndex];
      })
    );
    $textureHistory.set(
      produce($textureHistory.get(), (textureHistory) => {
        textureHistory[textureIndex] = textureHistory[textureIndex] || [];
        textureHistory[textureIndex].push({
          bufferKeys: $textureDefs.get()[textureIndex].bufferKeys
        });
      })
    );
    $textureDefs.set(
      produce($textureDefs.get(), (textureDefs) => {
        textureDefs[textureIndex].bufferKeys = bufferKeys;
      })
    );
    $hasEditedTextures.set(true);
  });
}

export function revertTextureImage({ textureIndex }: { textureIndex: number }) {
  const textureHistory = $textureHistory.get()[textureIndex];

  if (!textureHistory?.length) {
    return;
  }

  const previousTexture = textureHistory[textureHistory.length - 1];

  batch(() => {
    $editedTextures.set(
      produce($editedTextures.get(), (editedTextures) => {
        delete editedTextures[textureIndex];
      })
    );
    $textureHslSessions.set(
      produce($textureHslSessions.get(), (textureHslSessions) => {
        delete textureHslSessions[textureIndex];
      })
    );
    $textureHistory.set(
      produce($textureHistory.get(), (textureHistory) => {
        textureHistory[textureIndex].pop();
      })
    );
    $textureDefs.set(
      produce($textureDefs.get(), (textureDefs) => {
        textureDefs[textureIndex].bufferKeys.translucent =
          previousTexture.bufferKeys.translucent;
        textureDefs[textureIndex].bufferKeys.opaque =
          previousTexture.bufferKeys.opaque;
      })
    );
  });
}

export function setTextureHslSession({
  textureIndex,
  session
}: {
  textureIndex: number;
  session: TextureHslSession;
}) {
  $textureHslSessions.set(
    produce($textureHslSessions.get(), (textureHslSessions) => {
      textureHslSessions[textureIndex] = session;
    })
  );
}

export const loadPolygonFile = async (file: File) => {
  try {
    globalBuffers.clear();
    await processPolygonFile(file);
  } catch {
    return undefined;
  }
};

export const processPolygonFile = async (file: File) => {
  $loadTexturesState.set('idle');
  try {
    const fBuffer = await file.arrayBuffer();
    const buffer = sharedBufferFrom(Buffer.from(fBuffer));
    const { polygonBuffer, ...polygonResult } = await ClientThread.run<
      LoadPolygonFileWorkerPayload,
      LoadPolygonFileWorkerResult
    >('loadPolygonFile', { buffer, fileName: file.name });

    const result = {
      ...polygonResult,
      originalModels: structuredClone(polygonResult.models),
      polygonBufferKey: globalBuffers.add(polygonBuffer)
    };
    batch(() => {
      const {
        models,
        originalModels,
        textureDefs,
        fileName,
        polygonBufferKey,
        resourceAttribs
      } = result;

      $models.set(models);
      $originalModels.set(originalModels);
      $textureDefs.set(textureDefs);
      $resourceAttribs.set(resourceAttribs);
      $editedTextures.set({});
      $textureHslSessions.set({});
      $textureHistory.set({});
      $textureFileType.set(undefined);
      $polygonFileName.set(fileName);
      $textureFileName.set(undefined);
      $polygonBufferKey.set(polygonBufferKey);
      $hasEditedTextures.set(false);

      $modelIndex.set(
        result.models.findIndex((model) => model.meshes.length > 0)
      );
      $textureIndex.set(0);
      $selectedObjectIds.set({});
    });
    return result;
  } catch {
    return undefined;
  }
};

export const downloadPolygonFile = async () => {
  try {
    const polygonBufferKey = $polygonBufferKey.get();
    const polygonFileName = $polygonFileName.get();

    if (!polygonBufferKey || !polygonFileName) {
      showError({
        title: 'Invalid file selected',
        message: 'No valid polygon file was loaded.'
      });
      return;
    }

    try {
      const polygonBuffer = globalBuffers.get(polygonBufferKey);
      const fileOutput = new Blob([new Uint8Array(polygonBuffer)], {
        type: 'application/octet-stream'
      });
      const extensionStartIndex = polygonFileName.lastIndexOf('.');
      const name =
        extensionStartIndex < 0
          ? polygonFileName
          : polygonFileName.substring(0, extensionStartIndex);
      const extension =
        extensionStartIndex < 0
          ? 'bin'
          : polygonFileName.substring(extensionStartIndex + 1);

      saveAs(fileOutput, `${name}.mn.${extension}`);
    } catch (error: unknown) {
      console.error(error);
      let message = '';

      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'string') {
        message = error;
      } else {
        message = 'Unknown error occurred';
      }

      showError({
        title: 'Error exporting polygon file',
        message
      });
    }
  } catch {
    return undefined;
  }
};

/** Processes worker results and updates the model data signals. */
export const processTextureFile = async ({
  file,
  textureFileType,
  isLzssCompressed = false,
  textureBuffer,
  textureDefs: providedTextureDefs,
  resourceAttribs
}: LoadTexturesPayload) => {
  $loadTexturesState.set('pending');
  try {
    const resolvedResourceAttribs =
      resourceAttribs ?? resourceAttribMappings[textureFileType];

    let textureDefs: NLUITextureDef[];
    const isPolyMapped = resolvedResourceAttribs.polygonMapped;
    const activeResourceAttribs = isPolyMapped
      ? ($resourceAttribs.get() ?? resolvedResourceAttribs)
      : resolvedResourceAttribs;

    if (!isPolyMapped) {
      textureDefs =
        (providedTextureDefs?.length
          ? providedTextureDefs
          : activeResourceAttribs.textureShapesMap) ?? [];

      batch(() => {
        $models.set([]);
        $originalModels.set([]);
        $textureDefs.set(textureDefs);
        $resourceAttribs.set(activeResourceAttribs);
        $editedTextures.set({});
        $textureHslSessions.set({});
        $textureHistory.set({});
        $textureFileType.set(undefined);
        $polygonFileName.set(undefined);
        $textureFileName.set(undefined);
        $polygonBufferKey.set(undefined);
        $hasEditedTextures.set(false);

        $modelIndex.set(-1);
        $textureIndex.set(0);
        $selectedObjectIds.set({});
      });
    } else {
      textureDefs =
        activeResourceAttribs.textureShapesMap ?? $textureDefs.get();
    }

    let buffer: Uint8Array = new Uint8Array(
      textureBuffer instanceof SharedArrayBuffer
        ? new Uint8Array(textureBuffer)
        : new Uint8Array(await file.arrayBuffer())
    );

    const usesLzssTextureFile = Boolean(
      isLzssCompressed || activeResourceAttribs.hasLzssTextureFile
    );

    if (usesLzssTextureFile) {
      const fBuffer = await file.arrayBuffer();
      const sharedBuffer = sharedBufferFrom(fBuffer);
      buffer = Buffer.from(new Uint8Array(decompressLzssBuffer(sharedBuffer)));
    }
    const textureFileBuffer = sharedBufferFrom(buffer);

    const threadResult = await ClientThread.run<
      LoadTextureFileWorkerPayload,
      LoadTextureFileWorkerResult
    >('loadTextureFile', {
      fileName: file.name,
      textureDefs,
      textureFileBuffer,
      oobReferenceable: activeResourceAttribs.oobReferencable,
      isLzssCompressed: usesLzssTextureFile
    });

    const updatedTextureDefs = structuredClone(textureDefs);

    updatedTextureDefs.forEach((_t, i) => {
      imgTypes.forEach((imgType) => {
        const pixelBuffer =
          threadResult.texturePixelBuffers[
            imgType === 'opaque' ? i * 2 : i * 2 + 1
          ];

        const bufferKey = globalBuffers.add(pixelBuffer);
        updatedTextureDefs[i].bufferKeys = {
          ...(updatedTextureDefs[i]?.bufferKeys ?? {}),
          [imgType]: bufferKey
        };
      });
    });

    const textureBufferKey = globalBuffers.add(
      threadResult.decompressedTextureBuffer
    );

    const result = {
      textureBufferKey,
      textureDefs: updatedTextureDefs,
      textureFileType,
      fileName: file.name,
      isLzssCompressed:
        usesLzssTextureFile || Boolean(threadResult.isLzssCompressed),
      resourceAttribs: activeResourceAttribs
    };
    batch(() => {
      const payload = result;
      const {
        textureDefs,
        fileName,
        isLzssCompressed,
        textureBufferKey,
        textureFileType,
        resourceAttribs
      } = payload;

      $loadTexturesState.set('fulfilled');
      $textureDefs.set(textureDefs);
      $editedTextures.set({});
      $textureHslSessions.set({});
      $hasEditedTextures.set(false);
      $textureHistory.set({});
      $textureFileType.set(textureFileType);
      $textureFileName.set(fileName);
      $isLzssCompressed.set(Boolean(isLzssCompressed));
      $textureBufferKey.set(textureBufferKey);
      if (!resourceAttribs?.polygonMapped) {
        $resourceAttribs.set(resourceAttribs);
      }
    });
    return result;
  } catch {
    $loadTexturesState.set('rejected');
    return undefined;
  }
};

export const adjustTextureHsl = async (
  payload: TextureHslAdjustmentPayload
) => {
  try {
    const prevEditedTexture = $editedTextures.get()[payload.textureIndex];

    const { hsl } = payload;
    const uvClipPathKey = getTextureHslScopeKey(
      payload.textureIndex,
      payload.uvPixelByteIndexes
    );
    if (prevEditedTexture) {
      const prevHsl = prevEditedTexture?.hsl;
      if (
        prevHsl?.h === hsl.h &&
        prevHsl?.s === hsl.s &&
        prevHsl?.l === hsl.l &&
        prevEditedTexture.uvClipPathKey === uvClipPathKey
      ) {
        return;
      }
    }

    if (!prevEditedTexture && hsl.h === 0 && hsl.l === 0 && hsl.s === 0) {
      return;
    }

    const textureHslSession = $textureHslSessions.get()[payload.textureIndex];
    const isSameScope = textureHslSession?.scopeKey === uvClipPathKey;

    if (!isSameScope && payload.sourceBufferKeys) {
      setTextureHslSession({
        textureIndex: payload.textureIndex,
        session: {
          scopeKey: uvClipPathKey,
          sourceBufferKeys: payload.sourceBufferKeys,
          hsl
        }
      });
    } else if (textureHslSession) {
      setTextureHslSession({
        textureIndex: payload.textureIndex,
        session: { ...textureHslSession, hsl }
      });
    }

    setTimeout(() => {
      const activeSession = $textureHslSessions.get()[payload.textureIndex];

      if (
        prevEditedTexture?.bufferKeys.opaque &&
        prevEditedTexture.bufferKeys.opaque !==
          activeSession?.sourceBufferKeys.opaque
      ) {
        globalBuffers.delete(prevEditedTexture.bufferKeys.opaque);
      }

      if (
        prevEditedTexture?.bufferKeys.translucent &&
        prevEditedTexture.bufferKeys.translucent !==
          activeSession?.sourceBufferKeys.translucent
      ) {
        globalBuffers.delete(prevEditedTexture.bufferKeys.translucent);
      }
    }, 250);

    await processAdjustedTextureHsl(payload);
  } catch {
    return undefined;
  }
};

export const processAdjustedTextureHsl = async ({
  textureIndex,
  hsl,
  sourceBufferKeys,
  uvPixelByteIndexes
}: TextureHslAdjustmentPayload) => {
  try {
    const textureDef = $textureDefs.get()[textureIndex];
    const uvClipPathKey = getTextureHslScopeKey(
      textureIndex,
      uvPixelByteIndexes
    );
    const textureHslSession = $textureHslSessions.get()[textureIndex];
    const bufferKeys =
      textureHslSession?.scopeKey === uvClipPathKey
        ? textureHslSession.sourceBufferKeys
        : (sourceBufferKeys ?? textureDef.bufferKeys);

    const [opaqueRgbaBuffer, translucentRgbaBuffer] = await Promise.all(
      [bufferKeys.opaque, bufferKeys.translucent].map((bufferKey) =>
        ClientThread.run<
          AdjustTextureHslWorkerPayload,
          AdjustTextureHslWorkerResult
        >('adjustTextureHsl', {
          hsl,
          uvPixelByteIndexes,
          buffer: globalBuffers.getShared(bufferKey!)
        })
      )
    );

    const result = {
      bufferKeys: {
        opaque: globalBuffers.add(opaqueRgbaBuffer),
        translucent: globalBuffers.add(translucentRgbaBuffer)
      },
      textureIndex,
      hsl,
      uvClipPathKey
    };
    batch(() => {
      const { textureIndex, bufferKeys, hsl, uvClipPathKey } = result;
      const { width, height } = $textureDefs.get()[textureIndex];

      $editedTextures.set(
        produce($editedTextures.get(), (editedTextures) => {
          editedTextures[textureIndex] = {
            width,
            height,
            bufferKeys,
            hsl,
            uvClipPathKey
          };
        })
      );
      $hasEditedTextures.set(
        $hasEditedTextures.get() ||
          Object.keys($editedTextures.get()).length > 0
      );
    });
    return result;
  } catch {
    return undefined;
  }
};
