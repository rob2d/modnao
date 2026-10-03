import resourceAttribMappings from '@/constants/resourceAttribMappings';
import { showError } from '@/modules/error-messages';
import {
  $modelIndex,
  $selectedObjectIds,
  $textureIndex
} from '@/modules/object-viewer/objectViewerStore';
import { $replacementImage } from '@/modules/replace-texture/replaceTextureStore';
import {
  $selectedVertexGradientInputs,
  $updatedTextureDefs
} from '@/derivedState';
import type { NLUITextureDef, TextureDataUrlType } from '@/types';
import { decompressLzssBuffer, sharedBufferFrom } from '@/utils/data';
import decompressVqBuffer from '@/utils/data/decompressVqBuffer';
import globalBuffers from '@/utils/data/globalBuffers';
import writeVertexColorToBuffer from '@/utils/polygons/writeVertexColorToBuffer';
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
import { batch } from '@legendapp/state';
import saveAs from 'file-saver';
import { produce } from 'immer';
import {
  $editedTextures,
  $exportTextureFileState,
  $hasEditedTextures,
  $isLzssCompressed,
  $loadTexturesState,
  $models,
  $originalModels,
  $polygonBufferKey,
  $polygonFileName,
  $resourceAttribs,
  $textureBufferKey,
  $textureDefs,
  $textureFileName,
  $textureFileType,
  $textureHistory,
  $textureHslSessions,
  applySelectedVertexColorFulfilled,
  setTextureHslSession
} from './modelDataStore';
import {
  ApplySelectedVertexGradientPayload,
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
    $polygonBufferKey.set(undefined);
    $textureBufferKey.set(undefined);
    $textureDefs.set([]);
    $textureHslSessions.set({});
    $textureHistory.set({});
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

export const applySelectedVertexGradient = async ({
  startColor,
  endColor,
  angle,
  tilt,
  pivotPoint
}: ApplySelectedVertexGradientPayload) => {
  try {
    const modelIndex = $modelIndex.get();

    const { selectedVertices } = $selectedVertexGradientInputs.get();

    if (selectedVertices.length === 0) {
      const result = { modelIndex, vertexColorUpdates: [] };
      $models.set(
        produce($models.get(), (models) => {
          applySelectedVertexColorFulfilled(models, { payload: result });
        })
      );
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
        ([contentAddress, color]) => ({
          contentAddress,
          color
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

/** called from UI to clean up and then process texture file */
export const loadTextureFile = async (payload: LoadTexturesPayload) => {
  try {
    const textureDefs = $textureDefs.get();
    const textureHistory = $textureHistory.get();
    const editedTextures = $editedTextures.get();
    const replacementImage = $replacementImage.get();
    const resourceAttribs =
      payload.resourceAttribs ??
      resourceAttribMappings[payload.textureFileType];

    const prevPolygonBufferKey = $polygonBufferKey.get();
    const prevTextureBufferKey = $textureBufferKey.get();

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

      const textureDefKeys: string[] = textureDefs
        .flatMap((d) => [d.bufferKeys.opaque, d.bufferKeys.translucent])
        .filter(Boolean) as string[];

      const textureHistoryKeys: string[] = Object.values(textureHistory)
        .flatMap((textureSet) =>
          textureSet.flatMap((t) => [
            t.bufferKeys.opaque,
            t.bufferKeys.translucent
          ])
        )
        .filter(Boolean) as string[];
      const replacedTextureKeys = replacementImage?.bufferKey
        ? [replacementImage.bufferKey]
        : [];

      const editedTextureKeys: string[] = Object.values(editedTextures)
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

export const downloadTextureFile = async () => {
  $exportTextureFileState.set('pending');
  try {
    const textureFileName = $textureFileName.get() ?? '';
    const textureBufferKey = $textureBufferKey.get() ?? '';
    const textureDefs = $updatedTextureDefs.get();
    const textureFileType = $textureFileType.get();
    const isLzssCompressed = $isLzssCompressed.get();

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
        ...Object.keys($editedTextures.get()).map(Number),
        ...Object.entries($textureHistory.get())
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
                  textureDef.bufferKeys.translucent!
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
    $exportTextureFileState.set('rejected');
    return undefined;
  } finally {
    if ($exportTextureFileState.get() === 'pending') {
      $exportTextureFileState.set('fulfilled');
    }
  }
};
