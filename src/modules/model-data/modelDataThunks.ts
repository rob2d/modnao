import type { NLUITextureDef, TextureDataUrlType } from '@/types';
import { decompressLzssBuffer, sharedBufferFrom } from '@/utils/data';
import decompressVqBuffer from '@/utils/data/decompressVqBuffer';
import { HslValues } from '@/utils/textures';
import { VQ_TEXTURE_ENCODE_TYPE } from '@/utils/textures/VqFormatConstants';
import { ClientThread } from '@/utils/threads';
import globalBuffers from '@/utils/data/globalBuffers';
import O from '@/constants/StructOffsets';
import {
  LoadTextureFileWorkerPayload,
  LoadTextureFileWorkerResult
} from '@/workers/loadTextureFileWorker';
import { hslToRgb, rgbToHsl } from '@/utils/color-conversions';
import {
  LoadPolygonFileWorkerPayload,
  LoadPolygonFileWorkerResult
} from '@/workers/loadPolygonFileWorker';
import {
  AdjustTextureHslWorkerPayload,
  AdjustTextureHslWorkerResult
} from '@/workers/adjustTextureHslWorker';
import { showError } from '@/modules/error-messages';
import {
  selectHasCompressedTextures,
  selectSelectedVertexGradientInputs,
  selectTextureFileType,
  selectUpdatedTextureDefs
} from '@/selectors';
import { createAppAsyncThunk } from '@/storeTypings';
import saveAs from 'file-saver';
import {
  ExportTextureFileWorkerPayload,
  ExportTextureFileWorkerResult
} from '@/workers/exportTextureFileWorker';
import { ExportTextureDefRegionWorkerPayload } from '@/workers/exportTextureDefRegionWorker';
import resourceAttribMappings from '@/constants/resourceAttribMappings';
import {
  ApplySelectedVertexColorResult,
  ApplySelectedVertexGradientPayload,
  ApplySelectedVertexHslPayload,
  LoadPolygonsPayload,
  LoadTexturesPayload,
  LoadTexturesResultPayload
} from './modelDataTypes';

const imgTypes = ['opaque', 'translucent'] as TextureDataUrlType[];

export const sliceName = 'modelData';

interface TextureHslAdjustmentPayload {
  textureIndex: number;
  hsl: HslValues;
  uvPixelByteIndexes?: number[];
}

const getUvPixelByteIndexesKey = (uvPixelByteIndexes: number[] | undefined) =>
  !uvPixelByteIndexes?.length ? undefined : uvPixelByteIndexes.join(',');

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

const writeVertexColorToBuffer = (
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

const interpolateNormalizedColor = (
  startColor: NLColor,
  endColor: NLColor,
  amount: number,
  alpha: number
): NLColorRGBA => [
  startColor[0] + (endColor[0] - startColor[0]) * amount,
  startColor[1] + (endColor[1] - startColor[1]) * amount,
  startColor[2] + (endColor[2] - startColor[2]) * amount,
  alpha
];

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
export const loadCharacterPortraitsFile = createAppAsyncThunk(
  `${sliceName}/loadCharacterPortraitWsFile`,
  async (file: File, { dispatch }) => {
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

    await dispatch(
      loadTextureFile({
        file,
        textureFileType,
        textureDefs,
        textureBuffer: sharedBuffer,
        isLzssCompressed: false
      })
    );
  }
);

export const loadPolygonFile = createAppAsyncThunk(
  `${sliceName}/loadPolygonFile`,
  async (file: File, { dispatch }) => {
    globalBuffers.clear();
    await dispatch(processPolygonFile(file));
  }
);

export const processPolygonFile = createAppAsyncThunk(
  `${sliceName}/processPolygonFile`,
  async (file: File): Promise<LoadPolygonsPayload> => {
    const fBuffer = await file.arrayBuffer();
    const buffer = sharedBufferFrom(Buffer.from(fBuffer));
    const { polygonBuffer, ...result } = await ClientThread.run<
      LoadPolygonFileWorkerPayload,
      LoadPolygonFileWorkerResult
    >('loadPolygonFile', { buffer, fileName: file.name });

    return {
      ...result,
      polygonBufferKey: globalBuffers.add(polygonBuffer)
    };
  }
);

export const applySelectedVertexColor = createAppAsyncThunk(
  `${sliceName}/applySelectedVertexColor`,
  async (
    { hexColor }: { hexColor: string },
    { getState }
  ): Promise<ApplySelectedVertexColorResult> => {
    const state = getState();
    const { modelIndex, selectedIds } = state.objectViewer;
    const model = state.modelData.models[modelIndex];
    const color = hexToNormalizedColor(hexColor);

    if (!model || !color) {
      return { modelIndex, vertexColorUpdates: [] };
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

    return {
      modelIndex,
      vertexColorUpdates: Array.from(
        vertexColorUpdatesByAddress.entries(),
        ([contentAddress, vertexColor]) => ({
          contentAddress,
          color: vertexColor
        })
      )
    };
  }
);

export const applySelectedVertexHsl = createAppAsyncThunk(
  `${sliceName}/applySelectedVertexHsl`,
  async (
    { baseVertexColors, hsl }: ApplySelectedVertexHslPayload,
    { getState }
  ): Promise<ApplySelectedVertexColorResult> => {
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

    return {
      modelIndex,
      vertexColorUpdates
    };
  }
);

export const applySelectedVertexGradient = createAppAsyncThunk(
  `${sliceName}/applySelectedVertexGradient`,
  async (
    {
      startHexColor,
      endHexColor,
      angle,
      tilt
    }: ApplySelectedVertexGradientPayload,
    { getState }
  ): Promise<ApplySelectedVertexColorResult> => {
    const state = getState();
    const { modelIndex } = state.objectViewer;
    const startColor = hexToNormalizedColor(startHexColor);
    const endColor = hexToNormalizedColor(endHexColor);

    if (!startColor || !endColor) {
      return { modelIndex, vertexColorUpdates: [] };
    }

    const { selectedVertices } = selectSelectedVertexGradientInputs(state);

    if (selectedVertices.length === 0) {
      return { modelIndex, vertexColorUpdates: [] };
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

      vertexColorUpdatesByAddress.set(
        contentAddress,
        interpolateNormalizedColor(startColor, endColor, amount, alpha)
      );
    });

    const { polygonBufferKey } = state.modelData;

    if (polygonBufferKey) {
      const polygonBuffer = globalBuffers.get(polygonBufferKey);

      vertexColorUpdatesByAddress.forEach((vertexColor, contentAddress) => {
        writeVertexColorToBuffer(polygonBuffer, contentAddress, vertexColor);
      });
    }

    return {
      modelIndex,
      vertexColorUpdates: Array.from(
        vertexColorUpdatesByAddress.entries(),
        ([contentAddress, color]) => ({
          contentAddress,
          color
        })
      )
    };
  }
);

export const downloadPolygonFile = createAppAsyncThunk(
  `${sliceName}/downloadPolygonFile`,
  async (_, { getState, dispatch }) => {
    const state = getState();
    const { polygonBufferKey, polygonFileName } = state.modelData;

    if (!polygonBufferKey || !polygonFileName) {
      dispatch(
        showError({
          title: 'Invalid file selected',
          message: 'No valid polygon file was loaded.'
        })
      );
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

      dispatch(
        showError({
          title: 'Error exporting polygon file',
          message
        })
      );
    }
  }
);

/** called from UI to clean up and then process texture file */
export const loadTextureFile = createAppAsyncThunk(
  `${sliceName}/loadTextureFile`,
  async (payload: LoadTexturesPayload, { getState, dispatch }) => {
    const state = getState();
    const resourceAttribs =
      payload.resourceAttribs ??
      resourceAttribMappings[payload.textureFileType];

    // cleanup buffer if no polygon needed
    const prevPolygonBufferKey = state.modelData.polygonBufferKey;
    const prevTextureBufferKey = state.modelData.textureBufferKey;

    // cleanup texture related buffers
    setTimeout(() => {
      dispatch(
        processTextureFile({
          ...payload,
          resourceAttribs
        })
      );
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
  }
);

/** handled in reducer */
export const processTextureFile = createAppAsyncThunk(
  `${sliceName}/processTextureFile`,
  async (
    {
      file,
      textureFileType,
      isLzssCompressed = false,
      textureBuffer,
      textureDefs: providedTextureDefs,
      resourceAttribs
    }: LoadTexturesPayload,
    { getState, dispatch }
  ): Promise<LoadTexturesResultPayload> => {
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

      // clear polygons if texture headers aren't from poly file
      dispatch({
        type: processPolygonFile.fulfilled.type,
        payload: {
          models: [],
          fileName: undefined,
          polygonBufferKey: undefined,
          textureDefs,
          textureFileType,
          resourceAttribs: activeResourceAttribs
        }
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

        // serialize buffers before returning result to state
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

    return {
      textureBufferKey,
      textureDefs: updatedTextureDefs,
      textureFileType,
      fileName: file.name,
      isLzssCompressed:
        usesLzssTextureFile || Boolean(threadResult.isLzssCompressed),
      resourceAttribs: activeResourceAttribs
    };
  }
);

export const adjustTextureHsl = createAppAsyncThunk(
  `${sliceName}/adjustTextureHsl`,
  async (payload: TextureHslAdjustmentPayload, { getState, dispatch }) => {
    const state = getState();

    const prevEditedTexture =
      state.modelData.editedTextures[payload.textureIndex];

    // abort processing in reducer if no hsl change & edited
    const { hsl } = payload;
    const uvClipPathKey = getUvPixelByteIndexesKey(payload.uvPixelByteIndexes);
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

    // if no concrete changes and first edit, abort
    if (!prevEditedTexture && hsl.h === 0 && hsl.l === 0 && hsl.s === 0) {
      return;
    }

    setTimeout(() => {
      if (prevEditedTexture?.bufferKeys.opaque) {
        globalBuffers.delete(prevEditedTexture.bufferKeys.opaque);
      }

      if (prevEditedTexture?.bufferKeys.translucent) {
        globalBuffers.delete(prevEditedTexture.bufferKeys.translucent);
      }
    }, 250);

    await dispatch(processAdjustedTextureHsl(payload));
  }
);

export const processAdjustedTextureHsl = createAppAsyncThunk(
  `${sliceName}/processAdjustedTextureHsl`,
  async (
    { textureIndex, hsl, uvPixelByteIndexes }: TextureHslAdjustmentPayload,
    { getState }
  ) => {
    const state = getState();
    const textureDef = state.modelData.textureDefs[textureIndex];
    const { bufferKeys } = textureDef;

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

    return {
      bufferKeys: {
        opaque: globalBuffers.add(opaqueRgbaBuffer),
        translucent: globalBuffers.add(translucentRgbaBuffer)
      },
      textureIndex,
      hsl,
      uvClipPathKey: getUvPixelByteIndexesKey(uvPixelByteIndexes)
    };
  }
);

export const downloadTextureFile = createAppAsyncThunk(
  `${sliceName}/downloadTextureFile`,
  async (_, { getState, dispatch }) => {
    const state = getState();
    const { textureFileName = '', textureBufferKey = '' } = state.modelData;
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
      const textureBuffer = globalBuffers.getShared(textureBufferKey);

      // preserve unchanged VQ regions
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
              const copy = new ArrayBuffer(outputBuffer.byteLength); // Allocate a new ArrayBuffer
              new Uint8Array(copy).set(new Uint8Array(outputBuffer)); // Copy data
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

      const errorAction = showError({
        title: 'Error exporting texture',
        message
      });

      dispatch(errorAction);
    }
  }
);
