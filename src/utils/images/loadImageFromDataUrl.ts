export default function loadImageFromDataUrl(
  dataUrl: string
): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = function () {
      resolve(image);
    };

    image.src = dataUrl;
  });
}
