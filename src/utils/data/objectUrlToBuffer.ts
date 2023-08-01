export default async function objectUrlToBuffer(objectUrl: string) {
  const response = await fetch(objectUrl);
  const buffer = await response.arrayBuffer();
  return buffer;
}
