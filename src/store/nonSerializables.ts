// @TODO: migrate usage of nonserializables to store
// via object URLs
import { SourceTextureData } from '@/utils/textures/SourceTextureData';

const nonSerializables: {
  polygonBuffer?: Buffer;
  sourceTextureData: SourceTextureData[];
} = {
  polygonBuffer: undefined,
  sourceTextureData: []
};

export default nonSerializables;
