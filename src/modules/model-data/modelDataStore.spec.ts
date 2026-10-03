import { $updatedTextureDefs } from '@/selectors';
import { createTextureDef } from '@/utils/textures';
import { effect } from '@preact-signals/safe-react';
import {
  $hasEditedTextures,
  $loadTexturesState,
  $models,
  $originalModels,
  $textureDefs,
  $textureHistory,
  replaceTextureImage,
  resetModelData,
  revertTextureImage
} from './modelDataStore';

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
