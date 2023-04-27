export const toHexString = (a, size = 4) =>
  `0x${a.toString(16).padStart(size, '0')}`;
export const h = (a, notTestAddress = false) =>
  !notTestAddress ? a : a; /* toHexString(a) : toHexString(a) */

export const createHOffsetFn = (offset) => {
  return (a, notTestAddress = true) => h(a - offset, notTestAddress);
};
/**
 *
 * @param buffer
 * @returns buffer with base address
 */
export const getOBuffer = (buffer) => (baseAddress) => {
  return {
    readFloatLE: (o) => buffer.readFloatLE(baseAddress + o),
    readUInt8: (o) => buffer.readUInt8(baseAddress + o),
    readUInt32LE: (o) => buffer.readUInt32LE(baseAddress + o),
    readUInt32BE: (o) => buffer.readUInt32BE(baseAddress + o),
    readInt32LE: (o) => buffer.readInt32LE(baseAddress + o),
    readInt32BE: (o) => buffer.readInt32BE(baseAddress + o)
  };
};
