import { hasher } from 'node-object-hash';
import { NLUITextureDef } from '@/types/NLAbstractions';

const hashCreator = hasher({ sort: true, alg: 'sha1' });

export default function getTextureDefsHash(textureDefs: NLUITextureDef[]) {
  const hashableTextureDefs = textureDefs.map((d) => {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const { disableEdits, bufferKeys, colorFormat, ...hashableProps } = d;

    return hashableProps;
  });

  const textureDefsHash = hashCreator.hash(hashableTextureDefs);
  return textureDefsHash;
}
