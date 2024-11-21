import { BinFileReadOpSizes, NLPropConversion } from './NLPropConversionDefs';

export function processNLConversions<T extends ModNaoMemoryObject>(
  conversion: NLPropConversion<T>[],
  buffer: Buffer,
  baseAddress: number
): T {
  const object = {} as DeepPartial<T>;
  object.address = baseAddress;

  for (const {
    condition,
    targetOffset,
    readOps,
    updates,
    useOffsetAsBase
  } of conversion) {
    if (condition && !condition(object)) {
      // if conditional exists but not satisfied,
      // advance to next conversion
      continue;
    }

    const offset =
      typeof targetOffset === 'function'
        ? targetOffset(object, baseAddress)
        : targetOffset;

    let workingAddress = !useOffsetAsBase ? baseAddress + offset : offset;
    const values: number[] = [];

    readOps.forEach((op) => {
      if (workingAddress + (BinFileReadOpSizes.get(op) || 0) > buffer.length) {
        console.error(
          `went beyond buffer length while parsing object @ 0x${workingAddress.toString(
            16
          )}`
        );
        return;
      }
      values.push(op.call(buffer, workingAddress));
      workingAddress += BinFileReadOpSizes.get(op) || 0;
    });

    updates(object as T, values);
  }

  return object as T;
}
