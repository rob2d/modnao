import {
  $models,
  $polygonFileName,
  $textureDefs,
  $textureFileName,
  resetModelData
} from '@/modules/model-data/modelDataStore';
import { $updatedTextureDefs } from '@/derivedState';
import { createTextureDef } from '@/utils/textures';
import { observe } from '@legendapp/state';
import { useValue } from '@legendapp/state/react';
import { act, render, screen } from '@testing-library/react';
import {
  $modelIndex,
  $selectedObjectIds,
  $textureIndex,
  resetObjectViewer,
  setObjectKeys,
  setSelectedTextureIndex
} from './objectViewerStore';
import {
  navToNextObject,
  navToPrevObject,
  setObjectType,
  setObjectViewedIndex
} from './objectViewerThunks';

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
    return <p>Index: {useValue($textureIndex)}</p>;
  }
  function Textures() {
    textureRenders++;
    return <p>Textures: {useValue($updatedTextureDefs).length}</p>;
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
  const disposeModel = observe(() => {
    modelIndexes.push($modelIndex.get());
  });
  const disposeTexture = observe(() => {
    textureIndexes.push($textureIndex.get());
  });
  const disposeSelection = observe(() => {
    selections.push($selectedObjectIds.get());
  });

  try {
    $modelIndex.set(2);

    expect(modelIndexes).toEqual([-1, 2]);
    expect(textureIndexes).toEqual([-1]);
    expect(selections).toEqual([{}]);
    expect($modelIndex.get()).toBe(2);
  } finally {
    disposeModel();
    disposeTexture();
    disposeSelection();
  }
});

it('changes the viewed index and clears selection in one batch', async () => {
  $polygonFileName.set('STG01POL.BIN');
  $models.set([createModel(), createModel()]);
  $modelIndex.set(0);
  setObjectKeys(['0']);

  const states: { modelIndex: number; selectedIds: Record<string, true> }[] =
    [];
  const dispose = observe(() => {
    states.push({
      modelIndex: $modelIndex.get(),
      selectedIds: $selectedObjectIds.get()
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
  $polygonFileName.set('STG01POL.BIN');
  $models.set([
    createModel(),
    { meshes: [] } as unknown as NLModel,
    createModel()
  ]);
  await navToNextObject();
  expect($modelIndex.get()).toBe(0);
  setObjectKeys(['0']);
  await navToNextObject();
  expect($modelIndex.get()).toBe(2);
  expect($selectedObjectIds.get()).toEqual({});
  await navToNextObject();
  expect($modelIndex.get()).toBe(0);
  await navToPrevObject();
  expect($modelIndex.get()).toBe(2);
});

it('wraps texture navigation and handles an empty collection', async () => {
  $textureFileName.set('FONT.BIN');
  $textureDefs.set([createTextureDef({}), createTextureDef({})]);
  await navToNextObject();
  expect($textureIndex.get()).toBe(0);
  await navToPrevObject();
  expect($textureIndex.get()).toBe(1);
  await navToNextObject();
  expect($textureIndex.get()).toBe(0);
  $textureDefs.set([]);
  await navToNextObject();
  expect($textureIndex.get()).toBe(-1);
});

it('preserves complete mesh and polygon selections when changing selection type', async () => {
  $polygonFileName.set('STG01POL.BIN');
  $models.set([createModel(2)]);
  await navToNextObject();
  setObjectKeys(['0']);
  setObjectType('polygon');
  expect($selectedObjectIds.get()).toEqual({
    '0_0': true,
    '0_1': true
  });
  setObjectType('mesh');
  expect($selectedObjectIds.get()).toEqual({ '0': true });
  setObjectType('vertex');
  expect(Object.keys($selectedObjectIds.get())).toEqual([
    '0_0_0',
    '0_0_1',
    '0_1_0',
    '0_1_1'
  ]);
  setObjectType('polygon');
  expect($selectedObjectIds.get()).toEqual({});
  setObjectKeys(['0_0']);
  setObjectType('mesh');
  expect($selectedObjectIds.get()).toEqual({});
});
