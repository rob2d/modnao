import O from '@/constants/StructOffsets';
import writeVertexColorToBuffer from './writeVertexColorToBuffer';

describe('writeVertexColorToBuffer', () => {
  it('writes a vertex color in BGRA order without changing surrounding bytes', () => {
    const contentAddress = 8;
    const colorOffset = contentAddress + O.Vertex.COLORS;
    const buffer = new Uint8Array(colorOffset + 8).fill(0xaa);
    const expected = buffer.slice();
    expected.set([0, 128, 255, 64], colorOffset);

    writeVertexColorToBuffer(buffer, contentAddress, [1, 0.5, 0, 0.25]);

    expect(buffer).toEqual(expected);
  });

  it('leaves the buffer unchanged when a complete color will not fit', () => {
    const buffer = new Uint8Array(O.Vertex.COLORS + 3).fill(0xaa);
    const original = buffer.slice();

    writeVertexColorToBuffer(buffer, 0, [1, 0.5, 0, 1]);

    expect(buffer).toEqual(original);
  });
});
