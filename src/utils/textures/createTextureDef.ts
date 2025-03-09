import { NLUITextureDef } from '@/types/NLAbstractions';

export default function createTextureDef(
  def: Partial<NLUITextureDef>
): NLUITextureDef {
  return {
    width: 256,
    height: 256,
    colorFormat: 'RGB565',
    colorFormatValue: 2,
    bufferKeys: {
      translucent: undefined,
      opaque: undefined
    },
    type: 0,
    address: 0,
    baseLocation: 0,
    ramOffset: 0,
    ...def
  };
}
