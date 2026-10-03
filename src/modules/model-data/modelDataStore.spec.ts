import { $updatedTextureDefs } from '@/derivedState';
import { createTextureDef } from '@/utils/textures';
import { observe } from '@legendapp/state';
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
  const disposeModels = observe(() => {
    modelReads($models.get());
  });
  const disposeTextures = observe(() => {
    textureReads($textureDefs.get());
  });

  try {
    $loadTexturesState.set('pending');
    $originalModels.set([createModel()]);

    expect(modelReads).toHaveBeenCalledTimes(1);
    expect(textureReads).toHaveBeenCalledTimes(1);

    $models.set([createModel()]);

    expect(modelReads).toHaveBeenCalledTimes(2);
    expect(textureReads).toHaveBeenCalledTimes(1);
  } finally {
    disposeModels();
    disposeTextures();
  }
});

it('keeps texture replacement history and reverts one replacement at a time', () => {
  const original = { translucent: 'original', opaque: 'original-opaque' };
  $textureDefs.set([createTextureDef({ bufferKeys: original })]);
  replaceTextureImage({
    textureIndex: 0,
    bufferKeys: { translucent: 'first', opaque: 'first-opaque' }
  });
  replaceTextureImage({
    textureIndex: 0,
    bufferKeys: { translucent: 'second', opaque: 'second-opaque' }
  });
  expect($updatedTextureDefs.get()[0].bufferKeys.translucent).toBe('second');
  revertTextureImage({ textureIndex: 0 });
  expect($updatedTextureDefs.get()[0].bufferKeys.translucent).toBe('first');
  revertTextureImage({ textureIndex: 0 });
  expect($updatedTextureDefs.get()[0].bufferKeys).toEqual(original);
  expect($textureHistory.get()[0]).toEqual([]);
  expect($hasEditedTextures.get()).toBe(true);
});

it('restores an unloaded texture definition when its replacement is reverted', () => {
  const original = createTextureDef({});
  $textureDefs.set([original]);
  replaceTextureImage({
    textureIndex: 0,
    bufferKeys: { translucent: 'replacement', opaque: 'replacement-opaque' }
  });

  expect($updatedTextureDefs.get()[0].bufferKeys).toEqual({
    translucent: 'replacement',
    opaque: 'replacement-opaque'
  });
  expect($textureHistory.get()[0]).toEqual([
    { bufferKeys: original.bufferKeys }
  ]);

  revertTextureImage({ textureIndex: 0 });

  expect($updatedTextureDefs.get()[0].bufferKeys).toEqual({
    translucent: undefined,
    opaque: undefined
  });
  expect($textureHistory.get()[0]).toEqual([]);
});
