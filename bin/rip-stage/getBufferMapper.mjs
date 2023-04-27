const h = (a, size = 4) => `0x${a.toString(16).padStart(size, '0')}`;

/**
 * @param {*} buffer
 * @param {*} baseAddress
 * @returns method to scan mappings from a buffer
 */
export default function getBufferMapper(buffer, baseAddress, shouldLog) {
  let bAddress = baseAddress;
  let getBaseAddress = () => bAddress;

  const scanMapping = (mapping, namespace) => {
    const isNested = Array.isArray(mapping[0]);
    const baseAddress = getBaseAddress();

    if (shouldLog && namespace) {
      if (isNested) {
        mapping.map(([offset]) => {
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

    return isNested
      ? mapping.map(([offset, type]) =>
          buffer[`read${type}`](baseAddress + offset)
        )
      : buffer[`read${mapping[1]}`](baseAddress + mapping[0]);
  };

  scanMapping.setBaseAddress = (address) => (bAddress = address);
  scanMapping.getBaseAddress = getBaseAddress;

  return scanMapping;
}
