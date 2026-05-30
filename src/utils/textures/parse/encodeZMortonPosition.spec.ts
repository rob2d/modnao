import decodeZMortonPosition from '../serialize/decodeZMortonPosition';
import encodeZMortonPosition from './encodeZMortonPosition';

describe('encodeZMortonPosition', () => {
  it('keeps square textures in regular Morton order', () => {
    expect(encodeZMortonPosition(3, 2)).toBe(13);
    expect(decodeZMortonPosition(13)).toEqual([3, 2]);
  });

  it('round trips coordinates through Morton offsets', () => {
    const positions = [
      [0, 0],
      [16, 0],
      [0, 16],
      [127, 127],
      [255, 255]
    ] as const;

    positions.forEach(([positionX, positionY]) => {
      const offset = encodeZMortonPosition(positionX, positionY);

      expect(decodeZMortonPosition(offset)).toEqual([positionX, positionY]);
    });
  });
});
