export default function getImageDimensions(
  dataUrl: string
): Promise<[number, number]> {
  return new Promise((resolve) => {
    const i = new Image();
    i.onload = function () {
      resolve([i.width, i.height]);
    };

    i.src = dataUrl;
  });
}
