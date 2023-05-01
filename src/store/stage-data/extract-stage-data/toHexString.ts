export default function toHexString(a: number, size = 4) {
  return `0x${a.toString(16).padStart(size, '0')}`;
}
