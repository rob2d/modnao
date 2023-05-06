import {
  BinFileReadOp,
  BinFileReadOpSizes,
  NLPropConversion
} from './NLPropConversionDefs';

export function parseNLConversions<T extends ModNaoMemoryObject>(
  conversion: NLPropConversion<T>[],
  buffer: Buffer,
  baseAddress: number
): T {
  const object = {} as DeepPartial<T>;
  object.address = baseAddress;

  for (const { condition, targetOffset, readOps, updates } of conversion) {
    if (condition && !condition(object)) {
      // if conditional exists but not satisfied,
      // advance to next conversion
      continue;
    }

    const offset =
      typeof targetOffset === 'function'
        ? targetOffset(object, baseAddress)
        : targetOffset;

    let workingAddress = baseAddress + offset;
    const values: number[] = [];

    readOps.forEach((op: BinFileReadOp) => {
      values.push(op.call(buffer, workingAddress));
      workingAddress += BinFileReadOpSizes.get(op) || 0;
    });

    updates(object, values);
  }
  return object as T;
}
