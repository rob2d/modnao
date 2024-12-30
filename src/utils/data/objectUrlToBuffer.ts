export default async function objectUrlToBuffer(objectUrl: string) {
  try {
    const response = await fetch(objectUrl);
    const buffer = await response.arrayBuffer();
    return buffer;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    console.error('error occurred trying to retrieve objectURL:', objectUrl);
    return new ArrayBuffer(0);
  }
}
