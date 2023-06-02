// @TODO: when migrating from redux to recoil,
// integrate this into app-data state. Redux does not
// have a great paradigm for working with non-serializable
// data (at least immediate e.g. JSON)

const nonSerializables: {
  stagePolygonFile?: File;
  textureFile?: File;
} = {
  stagePolygonFile: undefined,
  textureFile: undefined
};

export default nonSerializables;
