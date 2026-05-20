import { rootReducer } from '../store';
import { processTextureFile } from './modelDataThunks';
import { ClientThread } from '@/utils/threads';
import createTextureDef from '@/utils/textures/createTextureDef';
import { ResourceAttribs } from '@/types/ResourceAttribs';
import { LoadTextureFileWorkerResult } from '@/workers/loadTextureFileWorker';

jest.mock('@/utils/threads', () => ({
  ClientThread: {
    run: jest.fn()
  }
}));

describe('modelDataThunks', () => {
  const runClientThread = jest.mocked(ClientThread.run);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('passes polygon resource attributes into texture processing', async () => {
    const textureDef = createTextureDef({ width: 1, height: 1 });
    const resourceAttribs: ResourceAttribs = {
      game: 'CVS2',
      name: 'Player & Groove Select',
      identifier: '0x00',
      resourceType: 'cvs2-menu',
      filenamePattern: '^DM00(.mn)?POL.BIN$',
      hasLzssTextureFile: false
    };
    const threadResult: LoadTextureFileWorkerResult = {
      texturePixelBuffers: [new SharedArrayBuffer(4), new SharedArrayBuffer(4)],
      decompressedTextureBuffer: new SharedArrayBuffer(2),
      resourceAttribs
    };

    runClientThread.mockResolvedValue(threadResult);

    const baseState = rootReducer(undefined, { type: 'test/init' });
    const getState = () => ({
      ...baseState,
      modelData: {
        ...baseState.modelData,
        textureDefs: [textureDef],
        resourceAttribs
      }
    });
    const dispatch = jest.fn();
    const file = new File([new Uint8Array([1, 2])], 'DM00TEX.BIN');

    await processTextureFile({
      file,
      textureFileType: 'vs2-demo-model',
      textureBuffer: new SharedArrayBuffer(2)
    })(dispatch, getState, undefined);

    expect(runClientThread).toHaveBeenCalledWith(
      'loadTextureFile',
      expect.objectContaining({ resourceAttribs })
    );
  });
});
