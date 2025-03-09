import convertImageDataToDataUrl from './converImageDataToDataUrl';

export default async function convertImageBufferToDataUrl(
  buffer: ArrayBuffer | SharedArrayBuffer,
  width: number,
  height: number
): Promise<string> {
  const uint8ClampedArray = new Uint8ClampedArray(buffer);
  const imageData = new ImageData(uint8ClampedArray, width, height);
  return convertImageDataToDataUrl(imageData);
}
