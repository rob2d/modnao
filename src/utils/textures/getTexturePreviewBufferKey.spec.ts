import getTexturePreviewBufferKey from './getTexturePreviewBufferKey';

describe('getTexturePreviewBufferKey', () => {
  it('switches between opaque and alpha-preserving buffers', () => {
    const keys = { opaque: 'opaque-buffer', translucent: 'alpha-buffer' };

    expect(getTexturePreviewBufferKey(keys, 'opaque')).toBe('opaque-buffer');
    expect(getTexturePreviewBufferKey(keys, 'transparent')).toBe(
      'alpha-buffer'
    );
    expect(getTexturePreviewBufferKey(keys, 'opaque')).toBe('opaque-buffer');
  });

  it.each(['opaque', 'transparent'] as const)(
    'uses the available buffer in %s mode',
    (mode) => {
      expect(
        getTexturePreviewBufferKey({ opaque: 'opaque-buffer' }, mode)
      ).toBe('opaque-buffer');
      expect(
        getTexturePreviewBufferKey({ translucent: 'alpha-buffer' }, mode)
      ).toBe('alpha-buffer');
      expect(getTexturePreviewBufferKey(undefined, mode)).toBeUndefined();
    }
  );
});
