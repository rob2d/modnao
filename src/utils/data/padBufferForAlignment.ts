export function padBufferForAlignment(
  alignment: number,
  buffer: Buffer | Uint8Array,
  startLocation = 0
) {
  const b32Alignment = (startLocation + buffer.length) % 32;
  let alignmentPadding: number;

  if (b32Alignment === alignment) {
    alignmentPadding = 0;
  } else if (b32Alignment > alignment) {
    alignmentPadding = 32 - b32Alignment + alignment;
  } else {
    alignmentPadding = alignment - b32Alignment;
  }

  return new Uint8Array(
    Buffer.concat([
      new Uint8Array(buffer),
      new Uint8Array(new Array(alignmentPadding).fill(0))
    ])
  );
}
