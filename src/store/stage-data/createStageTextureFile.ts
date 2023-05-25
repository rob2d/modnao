import { NLTextureDef } from '@/types/NLAbstractions';
import nonSerializables from '../nonSerializables';

export default async function createStageTextureFile(
  textureDefs: NLTextureDef[]
): Promise<void> {
  const { stageTextureFile } = nonSerializables;
  // @TODO: encode-z-morton codes into coordinates
  // @TODO: print dataUrl into rotated canvas to account for format

  let lastLocation = 0;
  for (const t of textureDefs) {
    lastLocation = Math.max(t.location, lastLocation);
  }
}
