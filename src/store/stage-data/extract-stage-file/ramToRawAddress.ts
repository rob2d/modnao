import Offsets from './Offsets';

export default function ramToBinAddress(a: number) {
  return a - Offsets.RAM;
}
