export default async function objectUrlToBuffer(objectUrl: string) {
  try {
    const response = await fetch(objectUrl);
    return await response.bytes();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    console.error('error occurred trying to retrieve objectURL:', objectUrl);
    return new Uint8Array(0);
  }
}
