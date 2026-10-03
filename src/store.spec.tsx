import O from '@/constants/StructOffsets';
import { $dialogShown, closeDialog } from '@/modules/dialogs/dialogsStore';
import { effect } from '@preact-signals/safe-react';
import { act, render, screen } from '@testing-library/react';
import { deserialize, serialize } from 'node:v8';
import {
  $exportTextureFileState,
  $hasEditedTextures,
  $loadTexturesState,
  $models,
  $originalModels,
  $polygonBufferKey,
  $polygonFileName,
  $textureBufferKey,
  $textureDefs,
  $textureFileName,
  $textureFileType,
  $textureHistory,
  replaceTextureImage,
  resetModelData,
  revertTextureImage
} from './modules/model-data/modelDataStore';
import {
  applySelectedVertexColor,
  downloadTextureFile,
  processPolygonFile,
  processTextureFile
} from './modules/model-data/modelDataThunks';
import {
  $modelIndex,
  $selectedObjectIds,
  $textureIndex,
  navToNextObject,
  navToPrevObject,
  resetObjectViewer,
  setObjectKeys,
  setObjectType,
  setObjectViewedIndex,
  setSelectedTextureIndex
} from './modules/object-viewer/objectViewerStore';
import { $updatedTextureDefs } from './selectors';
import { getState, resetState } from './store';
import globalBuffers from './utils/data/globalBuffers';
import {
  applyReplacedTextureImage,
  selectReplacementTexture
} from './modules/replace-texture/replaceTextureStore';
import { createTextureDef } from './utils/textures';
import { ClientThread } from './utils/threads';

globalThis.structuredClone ??= (value) => deserialize(serialize(value));

jest.mock('./utils/threads', () => ({ ClientThread: { run: jest.fn() } }));

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
  resetState();
  closeDialog();
  resetModelData();
  resetObjectViewer();
  globalBuffers.clear();
  jest.mocked(ClientThread.run).mockReset();
});

it('updates a signal consumer without rendering its parent or an unrelated consumer', () => {
  let parentRenders = 0;
  let textureRenders = 0;
  function Index() {
    return <p>Index: {$textureIndex.value}</p>;
  }
  function Textures() {
    textureRenders++;
    return <p>Textures: {$updatedTextureDefs.value.length}</p>;
  }
  function Parent() {
    parentRenders++;
    return (
      <>
        <Index />
        <Textures />
      </>
    );
  }
  render(<Parent />);
  act(() => setSelectedTextureIndex(3));
  expect(screen.getByText('Index: 3')).toBeInTheDocument();
  expect(parentRenders).toBe(1);
  expect(textureRenders).toBe(1);
});

it('updates the model index directly without notifying unrelated viewer signals', () => {
  const modelIndexes: number[] = [];
  const textureIndexes: number[] = [];
  const selections: Record<string, true>[] = [];
  const disposeModel = effect(() => {
    modelIndexes.push($modelIndex.value);
  });
  const disposeTexture = effect(() => {
    textureIndexes.push($textureIndex.value);
  });
  const disposeSelection = effect(() => {
    selections.push($selectedObjectIds.value);
  });

  try {
    $modelIndex.value = 2;

    expect(modelIndexes).toEqual([-1, 2]);
    expect(textureIndexes).toEqual([-1]);
    expect(selections).toEqual([{}]);
    expect($modelIndex.value).toBe(2);
  } finally {
    disposeModel();
    disposeTexture();
    disposeSelection();
  }
});

it('keeps model data subscribers independent of loading progress', () => {
  const modelReads = jest.fn();
  const textureReads = jest.fn();
  const disposeModels = effect(() => {
    modelReads($models.value);
  });
  const disposeTextures = effect(() => {
    textureReads($textureDefs.value);
  });

  try {
    $loadTexturesState.value = 'pending';
    $originalModels.value = [createModel()];

    expect(modelReads).toHaveBeenCalledTimes(1);
    expect(textureReads).toHaveBeenCalledTimes(1);

    $models.value = [createModel()];

    expect(modelReads).toHaveBeenCalledTimes(2);
    expect(textureReads).toHaveBeenCalledTimes(1);
  } finally {
    disposeModels();
    disposeTextures();
  }
});

it('edits selected vertex colors without changing the original models', async () => {
  const models = [createModel()];
  models[0].meshes[0].polygons[0].vertices[0] = {
    contentAddress: 16,
    colors: [0, 0, 0, 0.25]
  } as NLVertex;
  const originalModels = structuredClone(models);

  $models.value = models;
  $originalModels.value = originalModels;
  $modelIndex.value = 0;
  $polygonBufferKey.value = globalBuffers.add(
    new Uint8Array(16 + O.Vertex.COLORS + 4)
  );
  setObjectKeys(['0_0_0']);

  await applySelectedVertexColor({ hexColor: '#ff8000' });

  expect($models.value[0].meshes[0].polygons[0].vertices[0].colors).toEqual([
    1,
    128 / 255,
    0,
    0.25
  ]);
  expect($originalModels.value).toBe(originalModels);
  expect(originalModels[0].meshes[0].polygons[0].vertices[0].colors).toEqual([
    0, 0, 0, 0.25
  ]);
  expect(
    Array.from(
      globalBuffers.get($polygonBufferKey.value).slice(16 + O.Vertex.COLORS)
    )
  ).toEqual([0, 128, 255, 64]);
});

it('changes the viewed index and clears selection in one batch', async () => {
  $polygonFileName.value = 'STG01POL.BIN';
  $models.value = [createModel(), createModel()];
  $modelIndex.value = 0;
  setObjectKeys(['0']);

  const states: { modelIndex: number; selectedIds: Record<string, true> }[] =
    [];
  const dispose = effect(() => {
    states.push({
      modelIndex: $modelIndex.value,
      selectedIds: $selectedObjectIds.value
    });
  });

  try {
    await setObjectViewedIndex(1);

    expect(states).toEqual([
      { modelIndex: 0, selectedIds: { '0': true } },
      { modelIndex: 1, selectedIds: {} }
    ]);
  } finally {
    dispose();
  }
});

it('wraps navigation around real models and clears selection', async () => {
  $polygonFileName.value = 'STG01POL.BIN';
  $models.value = [
    createModel(),
    { meshes: [] } as unknown as NLModel,
    createModel()
  ];
  await navToNextObject();
  expect($modelIndex.value).toBe(0);
  setObjectKeys(['0']);
  await navToNextObject();
  expect($modelIndex.value).toBe(2);
  expect($selectedObjectIds.value).toEqual({});
  await navToNextObject();
  expect($modelIndex.value).toBe(0);
  await navToPrevObject();
  expect($modelIndex.value).toBe(2);
});

it('wraps texture navigation and handles an empty collection', async () => {
  $textureFileName.value = 'FONT.BIN';
  $textureDefs.value = [createTextureDef({}), createTextureDef({})];
  await navToNextObject();
  expect($textureIndex.value).toBe(0);
  await navToPrevObject();
  expect($textureIndex.value).toBe(1);
  await navToNextObject();
  expect($textureIndex.value).toBe(0);
  $textureDefs.value = [];
  await navToNextObject();
  expect($textureIndex.value).toBe(-1);
});

it('preserves complete mesh and polygon selections when changing selection type', async () => {
  $polygonFileName.value = 'STG01POL.BIN';
  $models.value = [createModel(2)];
  await navToNextObject();
  setObjectKeys(['0']);
  setObjectType('polygon');
  expect($selectedObjectIds.value).toEqual({
    '0_0': true,
    '0_1': true
  });
  setObjectType('mesh');
  expect($selectedObjectIds.value).toEqual({ '0': true });
  setObjectType('vertex');
  expect(Object.keys($selectedObjectIds.value)).toEqual([
    '0_0_0',
    '0_0_1',
    '0_1_0',
    '0_1_1'
  ]);
  setObjectType('polygon');
  expect($selectedObjectIds.value).toEqual({});
  setObjectKeys(['0_0']);
  setObjectType('mesh');
  expect($selectedObjectIds.value).toEqual({});
});

it('keeps texture replacement history and reverts one replacement at a time', () => {
  const original = { translucent: 'original', opaque: 'original-opaque' };
  $textureDefs.value = [createTextureDef({ bufferKeys: original })];
  replaceTextureImage({
    textureIndex: 0,
    bufferKeys: { translucent: 'first', opaque: 'first-opaque' }
  });
  replaceTextureImage({
    textureIndex: 0,
    bufferKeys: { translucent: 'second', opaque: 'second-opaque' }
  });
  expect($updatedTextureDefs.value[0].bufferKeys.translucent).toBe('second');
  revertTextureImage({ textureIndex: 0 });
  expect($updatedTextureDefs.value[0].bufferKeys.translucent).toBe('first');
  revertTextureImage({ textureIndex: 0 });
  expect($updatedTextureDefs.value[0].bufferKeys).toEqual(original);
  expect($textureHistory.value[0]).toEqual([]);
  expect($hasEditedTextures.value).toBe(true);
});

it('replaces a selected image, releases its previous buffer, and applies opaque and translucent pixels', async () => {
  $textureDefs.value = [createTextureDef({ width: 1, height: 1 })];
  await selectReplacementTexture({
    textureIndex: 0,
    imageFile: new SharedArrayBuffer(4)
  });
  const previousBufferKey =
    getState().replaceTexture.replacementImage!.bufferKey;
  expect($dialogShown.value).toBe('replace-texture');
  await selectReplacementTexture({
    textureIndex: 0,
    imageFile: new SharedArrayBuffer(4)
  });
  expect(globalBuffers.delete(previousBufferKey)).toBe(false);
  await applyReplacedTextureImage(new Uint8Array([1, 2, 3, 4]));
  const keys = $updatedTextureDefs.value[0].bufferKeys;
  expect(Array.from(globalBuffers.get(keys.translucent))).toEqual([1, 2, 3, 4]);
  expect(Array.from(globalBuffers.get(keys.opaque))).toEqual([1, 2, 3, 255]);
  expect($textureHistory.value[0]).toHaveLength(1);
  expect($dialogShown.value).toBeUndefined();
});

it('ends export progress when no texture file type is available', async () => {
  await downloadTextureFile();
  expect($exportTextureFileState.value).toBe('fulfilled');
  expect(getState().errorMessages.messages[0].title).toBe(
    'Invalid file selected'
  );
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
  expect($models.value).toEqual(models);
  expect($originalModels.value).toEqual(models);
  expect($originalModels.value).not.toBe(models);
  expect($modelIndex.value).toBe(1);
  expect($textureIndex.value).toBe(0);
});

it('loads a standalone texture file and clears the previous polygon state', async () => {
  $models.value = [createModel()];
  $polygonFileName.value = 'STG01POL.BIN';
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
  expect($loadTexturesState.value).toBe('fulfilled');
  expect($textureFileName.value).toBe('FONT.BIN');
  expect($models.value).toEqual([]);
  expect($polygonFileName.value).toBeUndefined();
  expect($modelIndex.value).toBe(-1);
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
  expect($loadTexturesState.value).toBe('pending');
  await operation;
  expect($loadTexturesState.value).toBe('rejected');
  $textureFileType.value = 'mvc2-font-file';
  $textureDefs.value = [];
  $textureBufferKey.value = globalBuffers.add(new Uint8Array(4));
  const errorLog = jest
    .spyOn(console, 'error')
    .mockImplementation(() => undefined);
  const exporting = downloadTextureFile();
  await exporting;
  expect($exportTextureFileState.value).toBe('fulfilled');
  expect(getState().errorMessages.messages[0].title).toBe(
    'Error exporting texture'
  );
  errorLog.mockRestore();
});
