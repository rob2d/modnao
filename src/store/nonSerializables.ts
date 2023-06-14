// @TODO: when migrating from redux to recoil,
// integrate this into app-data state. Redux does not
// have a great paradigm for working with non-serializable
// data (at least immediate e.g. JSON)

const nonSerializables: {
  polygonBuffer?: Buffer;
  textureBuffer?: Buffer;
  sourceTextureData: { translucent: ImageData; opaque: ImageData }[];
} = {
  polygonBuffer: undefined,
  textureBuffer: undefined,
  sourceTextureData: []
};

export default nonSerializables;
