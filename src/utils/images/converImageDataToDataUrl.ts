export default function convertImageDataToDataUrl(
  imageData: ImageData
): string {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Failed to get canvas context');
  }

  context.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
}
