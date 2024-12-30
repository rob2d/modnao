import TransferrableBuffer from '@/types/TransferrableBuffer';

export default async function bufferToObjectUrl(
  buffer: Buffer | TransferrableBuffer | Uint8Array,
  mimeType = 'application/octet-stream'
) {
  const blob = new Blob([buffer], { type: mimeType });
  return URL.createObjectURL(blob);
}
