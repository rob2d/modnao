import Offsets from './StructOffsets';

export default function ramToBinAddress(a: number) {
  return a - Offsets.RAM;
}
