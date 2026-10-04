/** @jest-environment node */
import resourceAttribMappings from '@/constants/resourceAttribMappings';
import encodeZMortonPosition from '@/utils/textures/parse/encodeZMortonPosition';
import exportTextureDefRegionWorker from './exportTextureDefRegionWorker';
import exportTextureFileWorker from './exportTextureFileWorker';
import loadTextureFileWorker from './loadTextureFileWorker';
import {
  loadIntroCharactersFile,
  loadTextureFile
} from '@/modules/model-data/modelDataThunks';
import { setupStore } from '@/store';
import { ClientThread } from '@/utils/threads';
import globalBuffers from '@/utils/data/globalBuffers';

describe('MVC2 intro character artwork', () => {
  const MVC2_INTRO_CHARACTER_COUNT = 56;
  const MVC2_INTRO_CHARACTER_TABLE_SIZE = 0xe0;
  const MVC2_INTRO_CHARACTER_TEXTURE_SIZE = 256 * 256 * 2;
  const textureFileType = 'mvc2-intro-characters';
  const textureDefs = resourceAttribMappings[textureFileType].textureShapesMap!;

  const createSource = () => {
    const source = Buffer.alloc(
      MVC2_INTRO_CHARACTER_TABLE_SIZE + MVC2_INTRO_CHARACTER_COUNT * 32
    );

    for (let index = 0; index < MVC2_INTRO_CHARACTER_COUNT; index++) {
      const start = MVC2_INTRO_CHARACTER_TABLE_SIZE + index * 32;
      source.writeUInt32LE(start, index * 4);
      // One literal, an overlapping 65535-word copy, and a terminator.
      const words = [0x6000, 0x8000 | index, 1, 65535, 0];
      words.forEach((word, offset) =>
        source.writeUInt16LE(word, start + offset * 2)
      );
    }

    return source;
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  const load = async (source: Buffer, fileName = 'DM08CHR.BIN') => {
    const file = new File([], fileName);
    file.arrayBuffer = jest
      .fn()
      .mockResolvedValue(Uint8Array.from(source).buffer);
    const dispatch = jest.fn();
    await loadIntroCharactersFile(file)(dispatch, jest.fn(), undefined);
    const pending = jest.fn();
    await dispatch.mock.calls[1][0](pending, () => ({ modelData: {} }));
    jest.clearAllTimers();
    expect(pending.mock.calls[0][0].type).toBe(loadTextureFile.pending.type);
    return loadTextureFileWorker({
      fileName,
      textureFileBuffer: pending.mock.calls[0][0].meta.arg.textureBuffer,
      textureDefs,
      oobReferenceable: false,
      isLzssCompressed: false
    });
  };

  it('defines all 56 twiddled ARGB4444 images at decoded offsets', () => {
    expect(textureDefs).toHaveLength(56);
    textureDefs.forEach((def, index) => {
      expect(def).toMatchObject({
        width: 256,
        height: 256,
        colorFormat: 'ARGB4444',
        colorFormatValue: 2,
        type: 1,
        baseLocation:
          MVC2_INTRO_CHARACTER_TABLE_SIZE +
          index * MVC2_INTRO_CHARACTER_TEXTURE_SIZE
      });
    });
  });

  it('loads all images and roundtrips their pixels through sectioned export', async () => {
    const source = createSource();
    const result = await load(source);

    expect(result.isLzssCompressed).toBeUndefined();
    expect(result.texturePixelBuffers).toHaveLength(112);
    for (const [index, def] of textureDefs.entries()) {
      const pixels = result.texturePixelBuffers[index * 2 + 1];
      expect(pixels.byteLength).toBe(256 * 256 * 4);
      expect(new Uint8Array(pixels).slice(0, 4)).toEqual(
        new Uint8Array([0, (index >>> 4) * 17, (index & 15) * 17, 136])
      );
      expect(new Uint8Array(result.texturePixelBuffers[index * 2])[3]).toBe(
        255
      );
      await exportTextureDefRegionWorker({
        textureDef: def,
        textureFileType,
        textureBuffer: result.decompressedTextureBuffer,
        pixelColors: pixels
      });
    }

    const exported = await exportTextureFileWorker({
      textureFileType,
      textureBuffer: result.decompressedTextureBuffer,
      isLzssCompressed: false
    });

    const reloaded = await load(Buffer.from(exported), 'DM08CHR.mn.BIN');
    expect(
      Buffer.from(reloaded.decompressedTextureBuffer).equals(
        Buffer.from(result.decompressedTextureBuffer)
      )
    ).toBe(true);
  });

  it('recompresses edits and reloads all textures with aligned section offsets', async () => {
    const source = createSource();
    const result = await load(source);
    const editedIndex = 24;
    const x = 17;
    const y = 39;
    const pixels = result.texturePixelBuffers[editedIndex * 2 + 1];
    new Uint8Array(pixels).set([255, 34, 51, 68], (y * 256 + x) * 4);

    await exportTextureDefRegionWorker({
      textureDef: textureDefs[editedIndex],
      textureFileType,
      textureBuffer: result.decompressedTextureBuffer,
      pixelColors: pixels
    });

    const exported = Buffer.from(
      await exportTextureFileWorker({
        textureFileType,
        textureBuffer: result.decompressedTextureBuffer,
        isLzssCompressed: false
      })
    );

    expect(exported.length % 32).toBe(0);
    expect(exported.readUInt32LE(0)).toBe(0xe0);
    for (let index = 0; index < 56; index++) {
      expect(exported.readUInt32LE(index * 4) % 32).toBe(0);
    }
    expect(exported.readUInt32LE((editedIndex + 1) * 4)).not.toBe(
      source.readUInt32LE((editedIndex + 1) * 4)
    );

    const reloaded = await load(exported, 'DM08CHR.mn.BIN');
    expect(
      Buffer.from(reloaded.decompressedTextureBuffer).equals(
        Buffer.from(result.decompressedTextureBuffer)
      )
    ).toBe(true);
    const reloadedPixels = new Uint8Array(
      reloaded.texturePixelBuffers[editedIndex * 2 + 1]
    );
    expect(
      reloadedPixels.slice((y * 256 + x) * 4, (y * 256 + x) * 4 + 4)
    ).toEqual(new Uint8Array([255, 34, 51, 68]));

    const decoded = Buffer.from(reloaded.decompressedTextureBuffer);
    expect(
      decoded.readUInt16LE(
        textureDefs[editedIndex].baseLocation +
          encodeZMortonPosition(x, 255 - y) * 2
      )
    ).toBe(0x4f23);
  }, 30000);

  it('requires each decoded section to contain a complete texture', async () => {
    const source = createSource();
    source.writeUInt16LE(65534, 0xe0 + 6);
    const file = new File([], 'DM08CHR.BIN');
    file.arrayBuffer = jest
      .fn()
      .mockResolvedValue(Uint8Array.from(source).buffer);
    const store = setupStore();
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    try {
      const result = await store.dispatch(loadIntroCharactersFile(file));
      expect(result.type).toBe(loadIntroCharactersFile.rejected.type);
      expect(store.getState().errorMessages.messages[0].message).toBe(
        'Invalid DM08CHR.BIN texture size'
      );
    } finally {
      consoleSpy.mockRestore();
    }
  });

  it('preprocesses the archive before dispatching the regular texture worker', async () => {
    jest.useFakeTimers();
    const source = createSource();
    const file = new File([], 'DM08CHR.BIN');
    file.arrayBuffer = jest
      .fn()
      .mockResolvedValue(Uint8Array.from(source).buffer);
    const store = setupStore();
    const worker = jest
      .spyOn(ClientThread, 'run')
      .mockResolvedValue(await load(source));

    try {
      await store.dispatch(loadIntroCharactersFile(file));
      await jest.advanceTimersByTimeAsync(250);

      expect(worker).toHaveBeenCalledWith('loadTextureFile', {
        fileName: file.name,
        textureDefs,
        textureFileBuffer: expect.any(SharedArrayBuffer),
        oobReferenceable: false,
        isLzssCompressed: false
      });
      expect(store.getState().modelData).toMatchObject({
        textureFileName: file.name,
        textureFileType,
        loadTexturesState: 'fulfilled'
      });
      expect(store.getState().modelData.textureDefs).toHaveLength(56);
    } finally {
      worker.mockRestore();
      jest.useRealTimers();
      globalBuffers.clear();
    }
  });

  it('reports preprocessing errors without changing the worker protocol', async () => {
    const file = new File([], 'DM08CHR.BIN');
    file.arrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(0));
    const store = setupStore();
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    try {
      const result = await store.dispatch(loadIntroCharactersFile(file));

      expect(result.type).toBe(loadIntroCharactersFile.rejected.type);
      expect(store.getState().errorMessages.messages).toEqual([
        { title: 'Error loading texture file', message: expect.any(String) }
      ]);
      expect(consoleSpy).toHaveBeenCalledTimes(1);
    } finally {
      consoleSpy.mockRestore();
    }
  });
});
