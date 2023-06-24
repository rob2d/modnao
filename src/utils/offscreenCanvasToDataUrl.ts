export default async function offscreenCanvasToDataUrl(
  canvas2: OffscreenCanvas
) {
  const blob = await canvas2.convertToBlob();
  const reader = new FileReader();

  const readFile = new Promise<string>(
    (resolve) => (reader.onloadend = () => resolve(reader.result as string))
  );

  reader.readAsDataURL(blob);
  const dataUrl = await readFile;
  return dataUrl;
}
