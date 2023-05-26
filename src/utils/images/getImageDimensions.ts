import loadImageFromDataUrl from './loadImageFromDataUrl';

export default async function getImageDimensions(
  dataUrl: string
): Promise<[number, number]> {
  const image = await loadImageFromDataUrl(dataUrl);
  return [image.width, image.height];
}
