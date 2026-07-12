import adjustTextureHslWorker from './adjustTextureHslWorker';
import { sharedBufferFrom } from '@/utils/data';
import {
  getUvClipPathBounds,
  getUvClipPathPixelByteIndexes
} from '@/utils/textures';

const bufferToArray = (buffer: SharedArrayBuffer) =>
  Array.from(new Uint8Array(buffer));

describe('adjustTextureHslWorker', () => {
  it('only adjusts pixels touched by provided UV clip paths', async () => {
    const source = Uint8Array.from([
      255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 255, 255, 255, 255
    ]);

    const result = await adjustTextureHslWorker({
      buffer: sharedBufferFrom(source),
      hsl: { h: 120, s: 0, l: 0 },
      uvPixelByteIndexes: getUvClipPathPixelByteIndexes(
        [
          getUvClipPathBounds([
            { x: 0, y: 0 },
            { x: 1.25, y: 0 },
            { x: 0, y: 1.25 }
          ])
        ],
        2,
        2
      )
    });

    expect(bufferToArray(result)).toEqual([
      0, 255, 0, 255, 0, 0, 255, 255, 255, 0, 0, 255, 255, 255, 255, 255
    ]);
  });

  it('adjusts every pixel when no selected pixel indexes are provided', async () => {
    const source = Uint8Array.from([
      255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 255, 255, 255, 255
    ]);

    const result = await adjustTextureHslWorker({
      buffer: sharedBufferFrom(source),
      hsl: { h: 120, s: 0, l: 0 }
    });

    expect(bufferToArray(result)).toEqual([
      0, 255, 0, 255, 0, 0, 255, 255, 255, 0, 0, 255, 255, 255, 255, 255
    ]);
  });
});
