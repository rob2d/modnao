// @TODO: when migrating from redux to recoil,
// integrate this into app-data state. Redux does not
// have a great paradigm for working with non-serializable
// data (at least immediate e.g. JSON)

import { SourceTextureData } from '@/utils/textures/SourceTextureData';

const nonSerializables: {
  polygonBuffer?: Buffer;
  textureBuffer?: Buffer;
  sourceTextureData: SourceTextureData[];
} = {
  polygonBuffer: undefined,
  textureBuffer: undefined,
  sourceTextureData: []
};

export default nonSerializables;
