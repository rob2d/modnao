export default async function objectUrlToBuffer(objectUrl: string) {
  try {
    const response = await fetch(objectUrl);
    const buffer = await response.arrayBuffer();
    return buffer;
  } catch (error) {
    console.error('error occurred trying to retrieve objectURL:', objectUrl);
    return new ArrayBuffer(0);
  }
}
