import O from '@/constants/StructOffsets';
import { normalizedColorChannelToByte } from '../color-conversions';

export default function writeVertexColorToBuffer(
  polygonBuffer: Uint8Array,
  contentAddress: number,
  color: NLColorRGBA
) {
  const colorOffset = contentAddress + O.Vertex.COLORS;

  if (colorOffset + 3 >= polygonBuffer.length) {
    return;
  }

  polygonBuffer[colorOffset] = normalizedColorChannelToByte(color[2]);
  polygonBuffer[colorOffset + 1] = normalizedColorChannelToByte(color[1]);
  polygonBuffer[colorOffset + 2] = normalizedColorChannelToByte(color[0]);
  polygonBuffer[colorOffset + 3] = normalizedColorChannelToByte(color[3]);
}
