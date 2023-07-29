import loadImageFromDataUrl from './loadImageFromDataUrl';

export default async function getImageDimensionsFromDataUrl(
  dataUrl: string
): Promise<[number, number]> {
  const image = await loadImageFromDataUrl(dataUrl);
  return [image.width, image.height];
}
