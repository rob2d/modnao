import { NLUITextureDef } from '@/types/NLAbstractions';
import globalBuffers from '@/utils/data/globalBuffers';
import createB64ImgFromTextureDef from './createB64ImgFromTextureDef';

jest.mock('jimp', () => {
  const getBase64 = jest.fn(async () => 'data:image/png;base64,test');
  const fromBitmap = jest.fn(() => ({ getBase64 }));
  const Jimp = { fromBitmap };

  return {
    fromBitmap,
    getBase64,
    Jimp
  };
});

const jimpMock = jest.requireMock('jimp') as {
  fromBitmap: jest.Mock;
  getBase64: jest.Mock;
  Jimp: {
    fromBitmap: jest.Mock;
  };
};

describe('createB64ImgFromTextureDef', () => {
  afterEach(() => {
    globalBuffers.clear();
    jimpMock.fromBitmap.mockClear();
    jimpMock.getBase64.mockClear();
  });

  it('creates a Jimp image from raw bitmap texture pixel data', async () => {
    const pixels = new Uint8Array([0xff, 0x00, 0x00, 0xff]);
    const bufferKey = globalBuffers.add(pixels);
    const textureDef: NLUITextureDef = {
      address: 0,
      baseLocation: 0,
      bufferKeys: {
        opaque: bufferKey,
        translucent: undefined
      },
      colorFormat: 'RGB565',
      colorFormatValue: 1,
      height: 1,
      ramOffset: 0,
      type: 0,
      width: 1
    };

    const result = await createB64ImgFromTextureDef({
      textureDef,
      asTranslucent: false
    });

    expect(jimpMock.Jimp.fromBitmap).toHaveBeenCalledWith({
      data: pixels,
      width: 1,
      height: 1
    });
    expect(jimpMock.getBase64).toHaveBeenCalledWith('image/png');
    expect(result).toBe('data:image/png;base64,test');
  });
});
