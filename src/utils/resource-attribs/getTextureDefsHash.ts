import { hasher } from 'node-object-hash';
import type { NLUITextureDef } from '@/types';

const hashCreator = hasher({ sort: true, alg: 'sha1' });

export default function getTextureDefsHash(textureDefs: NLUITextureDef[]) {
  const hashableTextureDefs = textureDefs.map((d) => {
    const { disableEdits, bufferKeys, colorFormat, ...hashableProps } = d;

    return hashableProps;
  });

  const textureDefsHash = hashCreator.hash(hashableTextureDefs);
  return textureDefsHash;
}
