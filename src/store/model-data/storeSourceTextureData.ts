import nonSerializables from '../nonSerializables';

export default async function storeSourceTextureData(
  bufferUrls: { opaque?: string; translucent?: string },
  textureIndex: number
) {
  for await (const [, url] of Object.entries(bufferUrls)) {
    if (!url) {
      continue;
    }

    // @TODO process both translucent and opaque data variants
    nonSerializables.sourceTextureData[textureIndex] = {
      opaque: url,
      translucent: url
    };
  }
}
