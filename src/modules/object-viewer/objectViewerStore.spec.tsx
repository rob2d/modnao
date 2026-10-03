import {
  $models,
  $polygonFileName,
  $textureDefs,
  $textureFileName,
  resetModelData
} from '@/modules/model-data/modelDataStore';
import { $updatedTextureDefs } from '@/selectors';
import { createTextureDef } from '@/utils/textures';
import { effect } from '@preact-signals/safe-react';
import { act, render, screen } from '@testing-library/react';
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
} from './objectViewerStore';

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
  resetModelData();
  resetObjectViewer();
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
