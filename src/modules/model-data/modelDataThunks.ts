import resourceAttribMappings from '@/constants/resourceAttribMappings';
import { showError } from '@/modules/error-messages';
import { $modelIndex } from '@/modules/object-viewer/objectViewerStore';
import { $replacementImage } from '@/modules/replace-texture/replaceTextureStore';
import {
  $selectedVertexGradientInputs,
  $updatedTextureDefs
} from '@/derivedState';
import { decompressLzssBuffer, sharedBufferFrom } from '@/utils/data';
import decompressVqBuffer from '@/utils/data/decompressVqBuffer';
import globalBuffers from '@/utils/data/globalBuffers';
import writeVertexColorToBuffer from '@/utils/polygons/writeVertexColorToBuffer';
import { VQ_TEXTURE_ENCODE_TYPE } from '@/utils/textures/VqFormatConstants';
import { ClientThread } from '@/utils/threads';
import { ExportTextureDefRegionWorkerPayload } from '@/workers/exportTextureDefRegionWorker';
import {
  ExportTextureFileWorkerPayload,
  ExportTextureFileWorkerResult
} from '@/workers/exportTextureFileWorker';
import { batch } from '@legendapp/state';
import saveAs from 'file-saver';
import { produce } from 'immer';
import {
  $editedTextures,
  $exportTextureFileState,
  $isLzssCompressed,
  $models,
  $polygonBufferKey,
  $textureBufferKey,
  $textureDefs,
  $textureFileName,
  $textureFileType,
  $textureHistory,
  $textureHslSessions,
  applySelectedVertexColorFulfilled,
  processTextureFile
} from './modelDataStore';
import {
  ApplySelectedVertexGradientPayload,
  LoadTexturesPayload
} from './modelDataTypes';

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
