export default function sharedBufferFrom(
  sourceBuffer:
    | Buffer
    | Buffer<ArrayBuffer>
    | Uint8Array<ArrayBufferLike>
    | ArrayBuffer
) {
  const sharedBuffer = new SharedArrayBuffer(sourceBuffer.byteLength);
  const wBuffer = new Uint8Array(sharedBuffer);
  wBuffer.set(
    sourceBuffer instanceof ArrayBuffer
      ? new Uint8Array(sourceBuffer)
      : sourceBuffer
  );

  return sharedBuffer;
}
