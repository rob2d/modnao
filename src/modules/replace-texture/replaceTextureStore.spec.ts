import { $dialogShown, closeDialog } from '@/modules/dialogs/dialogsStore';
import {
  $textureDefs,
  $textureHistory,
  resetModelData
} from '@/modules/model-data/modelDataStore';
import { $updatedTextureDefs } from '@/selectors';
import globalBuffers from '@/utils/data/globalBuffers';
import { createTextureDef } from '@/utils/textures';
import { effect } from '@preact-signals/safe-react';
import {
  $replacementImage,
  $textureIndex,
  applyReplacedTextureImage,
  resetReplaceTexture,
  selectReplacementTexture
} from './replaceTextureStore';

beforeEach(() => {
  resetReplaceTexture();
  closeDialog();
  resetModelData();
  globalBuffers.clear();
});

it('replaces a selected image, releases its previous buffer, and applies opaque and translucent pixels', async () => {
  $textureDefs.value = [createTextureDef({ width: 1, height: 1 })];
  await selectReplacementTexture({
    textureIndex: 0,
    imageFile: new SharedArrayBuffer(4)
  });
  const previousBufferKey = $replacementImage.value!.bufferKey;
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

it('changes replacement fields together without notifying index consumers for a new image at the same index', async () => {
  $textureDefs.value = [createTextureDef({ width: 1, height: 1 })];
  const states: [
    number,
    typeof $replacementImage.value,
    typeof $dialogShown.value
  ][] = [];
  const indexes: number[] = [];
  const disposeState = effect(() => {
    states.push([
      $textureIndex.value,
      $replacementImage.value,
      $dialogShown.value
    ]);
  });
  const disposeIndex = effect(() => {
    indexes.push($textureIndex.value);
  });

  try {
    const first = await selectReplacementTexture({
      textureIndex: 0,
      imageFile: new SharedArrayBuffer(4)
    });
    const second = await selectReplacementTexture({
      textureIndex: 0,
      imageFile: new SharedArrayBuffer(4)
    });
    resetReplaceTexture();

    expect(states).toEqual([
      [-1, undefined, undefined],
      [0, first!.replacementImage, 'replace-texture'],
      [0, second!.replacementImage, 'replace-texture'],
      [-1, undefined, 'replace-texture']
    ]);
    expect(indexes).toEqual([-1, 0, -1]);
  } finally {
    disposeState();
    disposeIndex();
  }
});
