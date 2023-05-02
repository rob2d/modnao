// @TODO: rethink ModelMappings in more TS-friendly way

import { BufferReadOp, ModelPropertyMapping } from './ModelMappings';

const h = (address: number, size = 4) =>
  `0x${address.toString(16).padStart(size, '0')}`;

/**
 * @returns method to scan mappings from a buffer
 */
export default function getBufferMapper(
  buffer: Buffer,
  baseAddress: number,
  shouldLog: boolean
) {
  let bAddress = baseAddress;
  const getBaseAddress = () => bAddress;

  const scanMapping = (mapping: any, namespace?: string) => {
    const isNested = Array.isArray(mapping[0]);
    const baseAddress = getBaseAddress();

    if (shouldLog && namespace) {
      if (isNested) {
        mapping.map((x: ModelPropertyMapping) => {
          const [offset] = x;
          console.log('baseAddress ->', h(baseAddress));
          console.log(
            `onScan [${namespace}, ${h(offset + baseAddress + 0x2cea0000)}]`
          );
        });
      } else {
        const offset = mapping[0];
        console.log(
          `onScan [${namespace}, ${h(offset + baseAddress + 0x2cea0000)}]`
        );
      }
    }

    return Array.isArray(mapping[0])
      ? mapping.map(([offset, type]: ModelPropertyMapping) =>
          buffer[type](baseAddress + offset)
        )
      : buffer[mapping[1] as BufferReadOp](baseAddress + mapping[0]);
  };

  scanMapping.setBaseAddress = (address: number) => (bAddress = address);
  scanMapping.getBaseAddress = getBaseAddress;

  return scanMapping;
}
