export default async function bufferToObjectUrl(
  buffer: Buffer,
  mimeType = 'application/octet-stream'
) {
  const blob = new Blob([buffer], { type: mimeType });
  return URL.createObjectURL(blob);
}
