import resourceAttribMappings from '@/constants/resourceAttribMappings';
import O from '@/constants/StructOffsets';
import { showError } from '@/modules/error-messages';
import { $modelData } from '@/modules/model-data/modelDataStore';
import { $objectViewer } from '@/modules/object-viewer/objectViewerStore';
import {
  $hasCompressedTextures,
  $selectedVertexGradientInputs,
  $textureFileType,
  $updatedTextureDefs
} from '@/selectors';
import { getState } from '@/store';
import type { NLUITextureDef, TextureDataUrlType } from '@/types';
import { hslToRgb, rgbToHsl } from '@/utils/color-conversions';
import { decompressLzssBuffer, sharedBufferFrom } from '@/utils/data';
import decompressVqBuffer from '@/utils/data/decompressVqBuffer';
import globalBuffers from '@/utils/data/globalBuffers';
import { HslValues, TextureImageBufferKeys } from '@/utils/textures';
import { VQ_TEXTURE_ENCODE_TYPE } from '@/utils/textures/VqFormatConstants';
import { ClientThread } from '@/utils/threads';
import {
  AdjustTextureHslWorkerPayload,
  AdjustTextureHslWorkerResult
} from '@/workers/adjustTextureHslWorker';
import { ExportTextureDefRegionWorkerPayload } from '@/workers/exportTextureDefRegionWorker';
import {
  ExportTextureFileWorkerPayload,
  ExportTextureFileWorkerResult
} from '@/workers/exportTextureFileWorker';
import {
  LoadPolygonFileWorkerPayload,
  LoadPolygonFileWorkerResult
} from '@/workers/loadPolygonFileWorker';
import {
  LoadTextureFileWorkerPayload,
  LoadTextureFileWorkerResult
} from '@/workers/loadTextureFileWorker';
import { batch } from '@preact-signals/safe-react';
import saveAs from 'file-saver';
import { produce } from 'immer';
import {
  applySelectedVertexColorFulfilled,
  setTextureHslSession
} from './modelDataStore';
import type { ModelDataState } from './modelDataTypes';
import {
  ApplySelectedVertexGradientPayload,
  ApplySelectedVertexHslPayload,
  LoadTexturesPayload
} from './modelDataTypes';

const imgTypes = ['opaque', 'translucent'] as TextureDataUrlType[];

interface TextureHslAdjustmentPayload {
  textureIndex: number;
  hsl: HslValues;
  sourceBufferKeys?: TextureImageBufferKeys;
  uvPixelByteIndexes?: number[];
}

export const getTextureHslScopeKey = (
  textureIndex: number,
  uvPixelByteIndexes: number[] | undefined
) => {
  if (!uvPixelByteIndexes?.length) {
    return `${textureIndex}:full`;
  }

  return `${textureIndex}:uv:${uvPixelByteIndexes.join(',')}`;
};

const hexToNormalizedColor = (hexColor: string): NLColor | undefined => {
  const hex = hexColor.replace(/^#/, '');

  if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
    return undefined;
  }

  return [
    parseInt(hex.slice(0, 2), 16) / 0xff,
    parseInt(hex.slice(2, 4), 16) / 0xff,
    parseInt(hex.slice(4, 6), 16) / 0xff
  ];
};

const normalizedColorChannelToByte = (channel: number) =>
  Math.round(Math.min(Math.max(channel, 0), 1) * 0xff);

export const writeVertexColorToBuffer = (
  polygonBuffer: Uint8Array,
  contentAddress: number,
  color: NLColorRGBA
) => {
  const colorOffset = contentAddress + O.Vertex.COLORS;

  if (colorOffset + 3 >= polygonBuffer.length) {
    return;
  }

  polygonBuffer[colorOffset] = normalizedColorChannelToByte(color[2]);
  polygonBuffer[colorOffset + 1] = normalizedColorChannelToByte(color[1]);
  polygonBuffer[colorOffset + 2] = normalizedColorChannelToByte(color[0]);
  polygonBuffer[colorOffset + 3] = normalizedColorChannelToByte(color[3]);
};

const adjustNormalizedColorHsl = (
  color: NLColorRGBA,
  hsl: HslValues
): NLColorRGBA => {
  const { h, s, l } = rgbToHsl(
    normalizedColorChannelToByte(color[0]),
    normalizedColorChannelToByte(color[1]),
    normalizedColorChannelToByte(color[2])
  );
  const adjustedH = (h + hsl.h + 360) % 360;
  const adjustedS = Math.max(0, Math.min(s + hsl.s, 100));
  const adjustedL = Math.max(0, Math.min(l + hsl.l, 100));
  const { r, g, b } = hslToRgb(adjustedH, adjustedS, adjustedL);

  return [r / 0xff, g / 0xff, b / 0xff, color[3]];
};

const getGradientDirection = (angle: number, tilt: number) => {
  const angleRadians = (angle * Math.PI) / 180;
  const tiltRadians = (tilt * Math.PI) / 180;
  const tiltScale = Math.cos(tiltRadians);
  const direction: Point3D = [
    Math.cos(angleRadians) * tiltScale,
    Math.sin(angleRadians) * tiltScale,
    Math.sin(tiltRadians)
  ];

  return direction;
};

const getPositionProjection = (position: Point3D, direction: Point3D) =>
  position[0] * direction[0] +
  position[1] * direction[1] +
  position[2] * direction[2];

const decompressLzssSection = (
  section: Buffer | Buffer<ArrayBuffer>,
  startPointer: number,
  endPointer?: number
) => {
  const compressedBufferSection = new Uint8Array(section).slice(
    startPointer,
    endPointer
  );
  return [
    Buffer.from(decompressLzssBuffer(Buffer.from(compressedBufferSection))),
    compressedBufferSection
  ] as const;
};

// @TODO modularize image section definitions for declarative loading
export const loadCharacterPortraitsFile = async (file: File) => {
  batch(() => {
    $modelData.value = produce($modelData.value, (state: ModelDataState) => {
      state.polygonBufferKey = undefined;
      state.textureBufferKey = undefined;
      state.textureDefs = [];
      state.textureHslSessions = {};
      state.textureHistory = {};
    });
  });
  try {
    const PTR_SIZE = 4;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const ogPointers = [buffer.readUInt32LE(0)];
    for (let i = 1; i < ogPointers[0] / PTR_SIZE; i++) {
      ogPointers.push(buffer.readUInt32LE(i * PTR_SIZE));
    }

    const sections: Buffer<ArrayBufferLike>[] = [];

    const [jpLifebar] = decompressLzssSection(
      buffer,
      ogPointers[0],
      ogPointers[1]
    );
    sections.push(jpLifebar);

    const [vq1Lzss] = decompressLzssSection(
      buffer,
      ogPointers[1],
      ogPointers[2]
    );
    const vq1Image = decompressVqBuffer(vq1Lzss, 256, 256);
    sections.push(vq1Image);

    const [vq2Lzss, compressedVq2Buffer] = decompressLzssSection(
      buffer,
      ogPointers[2],
      ogPointers?.[3]
    );
    const vq2Image = decompressVqBuffer(vq2Lzss, 128, 128);
    sections.push(vq2Image);

    const [usLifebar, compressedUsLifebar] =
      ogPointers.length <= 3
        ? [undefined, undefined]
        : decompressLzssSection(buffer, ogPointers[3]);

    if (usLifebar) {
      sections.push(Buffer.from(usLifebar));
    }

    let position = ogPointers[0];

    const pointerBuffer = Buffer.alloc(ogPointers[0]);
    for (let i = 0; i < sections.length; i++) {
      pointerBuffer.writeUInt32LE(position, PTR_SIZE * i);
      position += sections[i].length;
    }

    const trailingSection = new Uint8Array(buffer).slice(
      ogPointers[ogPointers.length - 1] +
        (compressedUsLifebar ?? compressedVq2Buffer).length
    );

    const finalSectionPointer =
      pointerBuffer.readUInt32LE(PTR_SIZE * (sections.length - 1)) +
      sections[sections.length - 1].length;

    const fsPointerBuffer = Buffer.alloc(4);
    fsPointerBuffer.writeUInt32LE(finalSectionPointer, 0);

    const decompressedBuffer = Buffer.concat([
      pointerBuffer,
      ...sections,
      trailingSection,
      fsPointerBuffer
    ]);

    const sharedBuffer = sharedBufferFrom(decompressedBuffer);

    const textureFileType = 'mvc2-character-portraits';
    const textureDefs = (
      resourceAttribMappings[textureFileType].textureShapesMap ?? []
    )
      .slice(0, ogPointers.length)
      .map((d, i) => ({
        ...d,
        baseLocation: pointerBuffer.readUInt32LE(i * PTR_SIZE)
      }));

    await loadTextureFile({
      file,
      textureFileType,
      textureDefs,
      textureBuffer: sharedBuffer,
      isLzssCompressed: false
    });
  } catch {
    return undefined;
  }
};

export const loadPolygonFile = async (file: File) => {
  try {
    globalBuffers.clear();
    await processPolygonFile(file);
  } catch {
    return undefined;
  }
};

export const processPolygonFile = async (file: File) => {
  batch(() => {
    $modelData.value = produce($modelData.value, (state: ModelDataState) => {
      state.loadTexturesState = 'idle';
    });
  });
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
      $modelData.value = produce($modelData.value, (state: ModelDataState) => {
        const {
          models,
          originalModels,
          textureDefs,
          fileName,
          polygonBufferKey,
          resourceAttribs
        } = result;
        state.models = models;
        state.originalModels = originalModels;
        state.textureDefs = textureDefs;
        state.resourceAttribs = resourceAttribs;
        state.editedTextures = {};
        state.textureHslSessions = {};
        state.textureHistory = {};
        state.textureFileType = undefined;
        state.polygonFileName = fileName;
        state.textureFileName = undefined;
        state.polygonBufferKey = polygonBufferKey;
        state.hasEditedTextures = false;
      });
      $objectViewer.value = produce($objectViewer.value, (state) => {
        const payload = result;
        const firstRealModelIndex = payload.models.findIndex(
          (model) => model.meshes.length > 0
        );
        Object.assign(state, {
          modelIndex: firstRealModelIndex,
          textureIndex: 0,
          selectedIds: {}
        });
      });
    });
    return result;
  } catch {
    return undefined;
  }
};

export const applySelectedVertexColor = async ({
  hexColor
}: {
  hexColor: string;
}) => {
  try {
    const state = getState();
    const { modelIndex, selectedIds } = state.objectViewer;
    const model = state.modelData.models[modelIndex];
    const color = hexToNormalizedColor(hexColor);

    if (!model || !color) {
      const result = { modelIndex, vertexColorUpdates: [] };
      batch(() => {
        $modelData.value = produce(
          $modelData.value,
          (state: ModelDataState) => {
            applySelectedVertexColorFulfilled(state, { payload: result });
          }
        );
      });
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

    const { polygonBufferKey } = state.modelData;

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
    batch(() => {
      $modelData.value = produce($modelData.value, (state: ModelDataState) => {
        applySelectedVertexColorFulfilled(state, { payload: result });
      });
    });
    return result;
  } catch {
    return undefined;
  }
};

export const applySelectedVertexHsl = async ({
  baseVertexColors,
  hsl
}: ApplySelectedVertexHslPayload) => {
  try {
    const state = getState();
    const { modelIndex } = state.objectViewer;
    const vertexColorUpdates = baseVertexColors.map(
      ({ contentAddress, color }) => ({
        contentAddress,
        color: adjustNormalizedColorHsl(color, hsl)
      })
    );
    const { polygonBufferKey } = state.modelData;

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
    batch(() => {
      $modelData.value = produce($modelData.value, (state: ModelDataState) => {
        applySelectedVertexColorFulfilled(state, { payload: result });
      });
    });
    return result;
  } catch {
    return undefined;
  }
};

export const applySelectedVertexGradient = async ({
  startColor,
  endColor,
  angle,
  tilt,
  pivotPoint
}: ApplySelectedVertexGradientPayload) => {
  try {
    const state = getState();
    const { modelIndex } = state.objectViewer;

    const { selectedVertices } = $selectedVertexGradientInputs.value;

    if (selectedVertices.length === 0) {
      const result = { modelIndex, vertexColorUpdates: [] };
      batch(() => {
        $modelData.value = produce(
          $modelData.value,
          (state: ModelDataState) => {
            applySelectedVertexColorFulfilled(state, { payload: result });
          }
        );
      });
      return result;
    }

    const direction = getGradientDirection(angle, tilt);
    let minProjection = Infinity;
    let maxProjection = -Infinity;

    selectedVertices.forEach(({ position }) => {
      const projection = getPositionProjection(position, direction);

      minProjection = Math.min(minProjection, projection);
      maxProjection = Math.max(maxProjection, projection);
    });

    const projectionRange = maxProjection - minProjection;
    const vertexColorUpdatesByAddress = new Map<number, NLColorRGBA>();

    selectedVertices.forEach(({ contentAddress, position, alpha }) => {
      const projection = getPositionProjection(position, direction);
      const amount =
        projectionRange === 0
          ? 0.5
          : (projection - minProjection) / projectionRange;
      const pivotedAmount =
        amount <= pivotPoint
          ? pivotPoint === 0
            ? 0.5
            : (amount / pivotPoint) * 0.5
          : pivotPoint === 1
            ? 0.5
            : 0.5 + ((amount - pivotPoint) / (1 - pivotPoint)) * 0.5;

      vertexColorUpdatesByAddress.set(contentAddress, [
        startColor[0] + (endColor[0] - startColor[0]) * pivotedAmount,
        startColor[1] + (endColor[1] - startColor[1]) * pivotedAmount,
        startColor[2] + (endColor[2] - startColor[2]) * pivotedAmount,
        alpha
      ]);
    });

    const { polygonBufferKey } = state.modelData;

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
        ([contentAddress, color]) => ({
          contentAddress,
          color
        })
      )
    };
    batch(() => {
      $modelData.value = produce($modelData.value, (state: ModelDataState) => {
        applySelectedVertexColorFulfilled(state, { payload: result });
      });
    });
    return result;
  } catch {
    return undefined;
  }
};

export const downloadPolygonFile = async () => {
  try {
    const state = getState();
    const { polygonBufferKey, polygonFileName } = state.modelData;

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

/** called from UI to clean up and then process texture file */
export const loadTextureFile = async (payload: LoadTexturesPayload) => {
  try {
    const state = getState();
    const resourceAttribs =
      payload.resourceAttribs ??
      resourceAttribMappings[payload.textureFileType];

    const prevPolygonBufferKey = state.modelData.polygonBufferKey;
    const prevTextureBufferKey = state.modelData.textureBufferKey;

    setTimeout(() => {
      processTextureFile({
        ...payload,
        resourceAttribs
      });
      if (prevTextureBufferKey) {
        globalBuffers.delete(prevTextureBufferKey);
      }

      if (prevPolygonBufferKey && !resourceAttribs.polygonMapped) {
        globalBuffers.delete(prevPolygonBufferKey);
      }

      const { modelData } = state;
      const textureDefKeys: string[] = modelData.textureDefs
        .flatMap((d) => [d.bufferKeys.opaque, d.bufferKeys.translucent])
        .filter(Boolean);

      const textureHistoryKeys: string[] = Object.values(
        modelData.textureHistory
      )
        .flatMap((textureSet) =>
          textureSet.flatMap((t) => [
            t.bufferKeys.opaque,
            t.bufferKeys.translucent
          ])
        )
        .filter(Boolean) as string[];
      const replacedTextureKeys = state.replaceTexture.replacementImage
        ?.bufferKey
        ? [state.replaceTexture.replacementImage.bufferKey]
        : [];

      const editedTextureKeys: string[] = Object.values(
        modelData.editedTextures
      )
        .flatMap((t) => [t.bufferKeys?.opaque, t.bufferKeys?.translucent])
        .filter(Boolean) as string[];

      [
        ...textureDefKeys,
        ...textureHistoryKeys,
        ...replacedTextureKeys,
        ...editedTextureKeys
      ].forEach((key) => {
        globalBuffers.delete(key);
      });
    }, 250);
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
  batch(() => {
    $modelData.value = produce($modelData.value, (state: ModelDataState) => {
      state.loadTexturesState = 'pending';
    });
  });
  try {
    const state = getState();
    const resolvedResourceAttribs =
      resourceAttribs ?? resourceAttribMappings[textureFileType];

    let textureDefs: NLUITextureDef[];
    const isPolyMapped = resolvedResourceAttribs.polygonMapped;
    const activeResourceAttribs = isPolyMapped
      ? (state.modelData.resourceAttribs ?? resolvedResourceAttribs)
      : resolvedResourceAttribs;

    if (!isPolyMapped) {
      textureDefs =
        (providedTextureDefs?.length
          ? providedTextureDefs
          : activeResourceAttribs.textureShapesMap) ?? [];

      batch(() => {
        const payload = {
          models: [],
          originalModels: [],
          fileName: undefined,
          polygonBufferKey: undefined,
          textureDefs,
          textureFileType,
          resourceAttribs: activeResourceAttribs
        };
        $modelData.value = produce(
          $modelData.value,
          (state: ModelDataState) => {
            const {
              models,
              originalModels,
              textureDefs,
              fileName,
              polygonBufferKey,
              resourceAttribs
            } = payload;
            state.models = models;
            state.originalModels = originalModels;
            state.textureDefs = textureDefs;
            state.resourceAttribs = resourceAttribs;
            state.editedTextures = {};
            state.textureHslSessions = {};
            state.textureHistory = {};
            state.textureFileType = undefined;
            state.polygonFileName = fileName;
            state.textureFileName = undefined;
            state.polygonBufferKey = polygonBufferKey;
            state.hasEditedTextures = false;
          }
        );
        $objectViewer.value = produce($objectViewer.value, (state) => {
          const firstRealModelIndex = -1;
          Object.assign(state, {
            modelIndex: firstRealModelIndex,
            textureIndex: 0,
            selectedIds: {}
          });
        });
      });
    } else {
      textureDefs =
        activeResourceAttribs.textureShapesMap ?? state.modelData.textureDefs;
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
      $modelData.value = produce($modelData.value, (state: ModelDataState) => {
        const payload = result;
        const {
          textureDefs,
          fileName,
          isLzssCompressed,
          textureBufferKey,
          textureFileType,
          resourceAttribs
        } = payload;
        state.loadTexturesState = 'fulfilled';
        state.textureDefs = textureDefs;
        state.editedTextures = {};
        state.textureHslSessions = {};
        state.hasEditedTextures = false;
        state.textureHistory = {};
        state.textureFileType = textureFileType;
        state.textureFileName = fileName;
        state.isLzssCompressed = Boolean(isLzssCompressed);
        state.textureBufferKey = textureBufferKey;
        if (!resourceAttribs?.polygonMapped) {
          state.resourceAttribs = resourceAttribs;
        }
      });
    });
    return result;
  } catch {
    batch(() => {
      $modelData.value = produce($modelData.value, (state: ModelDataState) => {
        state.loadTexturesState = 'rejected';
      });
    });
    return undefined;
  }
};

export const adjustTextureHsl = async (
  payload: TextureHslAdjustmentPayload
) => {
  try {
    const state = getState();

    const prevEditedTexture =
      state.modelData.editedTextures[payload.textureIndex];

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

    const textureHslSession =
      state.modelData.textureHslSessions[payload.textureIndex];
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
      const activeSession =
        getState().modelData.textureHslSessions[payload.textureIndex];

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
    const state = getState();
    const textureDef = state.modelData.textureDefs[textureIndex];
    const uvClipPathKey = getTextureHslScopeKey(
      textureIndex,
      uvPixelByteIndexes
    );
    const textureHslSession = state.modelData.textureHslSessions[textureIndex];
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
          buffer: globalBuffers.getShared(bufferKey)
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
      $modelData.value = produce($modelData.value, (state: ModelDataState) => {
        const { textureIndex, bufferKeys, hsl, uvClipPathKey } = result;
        const { width, height } = state.textureDefs[textureIndex];
        state.editedTextures[textureIndex] = {
          width,
          height,
          bufferKeys,
          hsl,
          uvClipPathKey
        };
        state.hasEditedTextures =
          state.hasEditedTextures ||
          Object.keys(state.editedTextures).length > 0;
      });
    });
    return result;
  } catch {
    return undefined;
  }
};

export const downloadTextureFile = async () => {
  batch(() => {
    $modelData.value = produce($modelData.value, (state: ModelDataState) => {
      state.exportTextureFileState = 'pending';
    });
  });
  try {
    const state = getState();
    const { textureFileName = '', textureBufferKey = '' } = state.modelData;
    const textureDefs = $updatedTextureDefs.value;
    const textureFileType = $textureFileType.value;
    const isLzssCompressed = $hasCompressedTextures.value;

    if (!textureFileType) {
      showError({
        title: 'Invalid file selected',
        message: 'No valid texture filetype was loaded.'
      });
      return;
    }

    try {
      const textureBuffer = globalBuffers.getShared(textureBufferKey);

      const changedTextureIndexes = new Set([
        ...Object.keys(state.modelData.editedTextures).map(Number),
        ...Object.entries(state.modelData.textureHistory)
          .filter(([, history]) => history.length > 0)
          .map(([textureIndex]) => Number(textureIndex))
      ]);

      await Promise.all(
        textureDefs
          .map((textureDef, textureIndex) => ({ textureDef, textureIndex }))
          .filter(
            ({ textureDef, textureIndex }) =>
              textureDef.type !== VQ_TEXTURE_ENCODE_TYPE ||
              changedTextureIndexes.has(textureIndex)
          )
          .map(({ textureDef }) =>
            ClientThread.run<ExportTextureDefRegionWorkerPayload, void>(
              'exportTextureDefRegion',
              {
                textureDef,
                textureFileType,
                textureBuffer,
                pixelColors: globalBuffers.getShared(
                  textureDef.bufferKeys.translucent
                )
              }
            )
          )
      );

      const outputBuffer = await ClientThread.run<
        ExportTextureFileWorkerPayload,
        ExportTextureFileWorkerResult
      >('exportTextureFile', {
        textureFileType,
        isLzssCompressed,
        textureBuffer
      });

      const arrayBuffer =
        outputBuffer instanceof SharedArrayBuffer
          ? (() => {
              const copy = new ArrayBuffer(outputBuffer.byteLength);
              new Uint8Array(copy).set(new Uint8Array(outputBuffer));
              return copy;
            })()
          : outputBuffer;

      const fileOutput = new Blob([new Uint8Array(arrayBuffer)], {
        type: 'application/octet-stream'
      });
      const name = textureFileName.substring(
        0,
        textureFileName.lastIndexOf('.')
      );
      const extension = textureFileName.substring(
        textureFileName.lastIndexOf('.') + 1
      );

      saveAs(fileOutput, `${name}.mn.${extension}`);
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

      showError({
        title: 'Error exporting texture',
        message
      });
    }
  } catch {
    batch(() => {
      $modelData.value = produce($modelData.value, (state: ModelDataState) => {
        state.exportTextureFileState = 'rejected';
      });
    });
    return undefined;
  } finally {
    if ($modelData.value.exportTextureFileState === 'pending') {
      $modelData.value = produce($modelData.value, (state) => {
        state.exportTextureFileState = 'fulfilled';
      });
    }
  }
};
