import Offsets from '../../../constants/StructOffsets';

export default function ramToBinAddress(a: number) {
  return a - Offsets.RAM;
}
