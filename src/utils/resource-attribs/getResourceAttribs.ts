import resourceAttribMappings from '@/constants/resourceAttribMappings';

const filenameOnlyMappings = Object.values(resourceAttribMappings).filter(
  (attribs) => attribs.allowFileNameOnlyMatch || attribs.textureDefsHash
);

export default function getResourceAttribs(hash: string, fileName: string) {
  const hashEntry = resourceAttribMappings[hash];

  const foundResource =
    hashEntry && new RegExp(hashEntry.filenamePattern, 'i').test(fileName);

  if (foundResource) {
    return hashEntry;
  }

  return filenameOnlyMappings.find(
    (attribs) =>
      (!attribs.textureDefsHash || attribs.textureDefsHash === hash) &&
      new RegExp(attribs.filenamePattern, 'i').test(fileName)
  );
}
