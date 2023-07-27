export default function loadDataUrlFromImageFile(file: File): Promise<string> {
  const reader = new FileReader();
  return new Promise((resolve) => {
    reader.onload = (event) => {
      if (!event || !event.target || typeof event.target.result !== 'string') {
        return;
      }
      resolve(event.target.result);
    };

    reader.readAsDataURL(file);
  });
}
