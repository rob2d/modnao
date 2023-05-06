import {
  BinFileReadOp,
  BinFileReadOpSizes,
  NLPropConversion
} from './NLPropConversionDefs';

export function parseNLConversions<T extends ModNaoMemoryObject>(
  converters: NLPropConversion<T>[],
  buffer: Buffer,
  baseAddress: number
): T {
  const object = {} as DeepPartial<T>;

  for (const { targetOffset, readOps, updates } of converters) {
    let workingAddress = baseAddress + targetOffset;
    const values: number[] = [];

    readOps.forEach((op: BinFileReadOp) => {
      values.push(op.call(buffer, workingAddress));
      workingAddress += BinFileReadOpSizes.get(op) || 0;
    });

    updates(object, values);
  }

  object.address = baseAddress;

  return object as T;
}
