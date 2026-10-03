import O from '@/constants/StructOffsets';
import { $messages, resetErrorMessages } from '@/modules/error-messages';
import {
  $modelIndex,
  $textureIndex,
  resetObjectViewer,
  setObjectKeys
} from '@/modules/object-viewer/objectViewerStore';
import globalBuffers from '@/utils/data/globalBuffers';
import { createTextureDef } from '@/utils/textures';
import { ClientThread } from '@/utils/threads';
import { deserialize, serialize } from 'node:v8';
import {
  $exportTextureFileState,
  $loadTexturesState,
  $models,
  $originalModels,
  $polygonBufferKey,
  $polygonFileName,
  $textureBufferKey,
  $textureDefs,
  $textureFileName,
  $textureFileType,
  applySelectedVertexColor,
  resetModelData
} from './modelDataStore';
import {
  downloadTextureFile,
  processPolygonFile,
  processTextureFile
} from './modelDataThunks';

globalThis.structuredClone ??= (value) => deserialize(serialize(value));

jest.mock('@/utils/threads', () => ({ ClientThread: { run: jest.fn() } }));

const createModel = (polygonCount = 1) =>
  ({
    meshes: [
      {
        hasColoredVertices: true,
        polygons: Array.from({ length: polygonCount }, () => ({
          vertices: [{}, {}]
        }))
      }
    ]
  }) as NLModel;

beforeEach(() => {
  resetErrorMessages();
  resetModelData();
  resetObjectViewer();
  globalBuffers.clear();
  jest.mocked(ClientThread.run).mockReset();
});

it('edits selected vertex colors without changing the original models', async () => {
  const models = [createModel()];
  models[0].meshes[0].polygons[0].vertices[0] = {
    contentAddress: 16,
    colors: [0, 0, 0, 0.25]
  } as NLVertex;
  const originalModels = structuredClone(models);

  $models.set(models);
  $originalModels.set(originalModels);
  $modelIndex.set(0);
  $polygonBufferKey.set(
    globalBuffers.add(new Uint8Array(16 + O.Vertex.COLORS + 4))
  );
  setObjectKeys(['0_0_0']);

  await applySelectedVertexColor({ hexColor: '#ff8000' });

  expect($models.get()[0].meshes[0].polygons[0].vertices[0].colors).toEqual([
    1,
    128 / 255,
    0,
    0.25
  ]);
  expect($originalModels.get()).toBe(originalModels);
  expect(originalModels[0].meshes[0].polygons[0].vertices[0].colors).toEqual([
    0, 0, 0, 0.25
  ]);
  expect(
    Array.from(
      globalBuffers.get($polygonBufferKey.get()!).slice(16 + O.Vertex.COLORS)
    )
  ).toEqual([0, 128, 255, 64]);
});

it('ends export progress when no texture file type is available', async () => {
  await downloadTextureFile();
  expect($exportTextureFileState.get()).toBe('fulfilled');
  expect($messages.get()[0].title).toBe('Invalid file selected');
});

it('applies polygon worker results to data and viewer state together', async () => {
  const models = [{ meshes: [] } as unknown as NLModel, createModel()];
  jest.mocked(ClientThread.run).mockResolvedValue({
    models,
    textureDefs: [],
    fileName: 'STG01POL.BIN',
    polygonBuffer: new Uint8Array(4)
  });
  const file = {
    name: 'STG01POL.BIN',
    arrayBuffer: async () => new ArrayBuffer(4)
  } as File;
  const result = await processPolygonFile(file);
  expect(result).toBeDefined();
  expect($models.get()).toEqual(models);
  expect($originalModels.get()).toEqual(models);
  expect($originalModels.get()).not.toBe(models);
  expect($modelIndex.get()).toBe(1);
  expect($textureIndex.get()).toBe(0);
});

it('loads a standalone texture file and clears the previous polygon state', async () => {
  $models.set([createModel()]);
  $polygonFileName.set('STG01POL.BIN');
  jest.mocked(ClientThread.run).mockResolvedValue({
    texturePixelBuffers: [new Uint8Array(4), new Uint8Array(4)],
    decompressedTextureBuffer: new Uint8Array(4)
  });
  const file = {
    name: 'FONT.BIN',
    arrayBuffer: async () => new ArrayBuffer(4)
  } as File;
  const result = await processTextureFile({
    file,
    textureFileType: 'mvc2-font-file',
    textureDefs: [createTextureDef({ width: 1, height: 1 })]
  });
  expect(result).toBeDefined();
  expect($loadTexturesState.get()).toBe('fulfilled');
  expect($textureFileName.get()).toBe('FONT.BIN');
  expect($models.get()).toEqual([]);
  expect($polygonFileName.get()).toBeUndefined();
  expect($modelIndex.get()).toBe(-1);
});

it('ends loading and export progress when operations fail', async () => {
  jest.mocked(ClientThread.run).mockRejectedValue(new Error('worker failed'));
  const file = {
    name: 'FONT.BIN',
    arrayBuffer: async () => new ArrayBuffer(4)
  } as File;
  const operation = processTextureFile({
    file,
    textureFileType: 'mvc2-font-file',
    textureDefs: [createTextureDef({})]
  });
  expect($loadTexturesState.get()).toBe('pending');
  await operation;
  expect($loadTexturesState.get()).toBe('rejected');
  $textureFileType.set('mvc2-font-file');
  $textureDefs.set([]);
  $textureBufferKey.set(globalBuffers.add(new Uint8Array(4)));
  const errorLog = jest
    .spyOn(console, 'error')
    .mockImplementation(() => undefined);
  const exporting = downloadTextureFile();
  await exporting;
  expect($exportTextureFileState.get()).toBe('fulfilled');
  expect($messages.get()[0].title).toBe('Error exporting texture');
  errorLog.mockRestore();
});
