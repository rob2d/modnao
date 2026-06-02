import resourceAttribMappings from '@/constants/resourceAttribMappings';

const mappingsByFilename = Object.values(resourceAttribMappings).filter(
  (attribs) => attribs.filenamePattern || attribs.textureDefsHash
);

export default function getResourceAttribs(hash: string, fileName: string) {
  const hashEntry = resourceAttribMappings[hash];

  console.log('hash ->', hash);

  const foundResource =
    hashEntry && new RegExp(hashEntry.filenamePattern, 'i').test(fileName);
  if (foundResource) {
    return hashEntry;
  }

  console.log('hashEntry ->', hashEntry);
  console.log('fileName ->', fileName);

  const fileNameAndHashMatch = Object.values(resourceAttribMappings).find(
    (attribs) =>
      attribs.textureDefsHash === hash &&
      new RegExp(attribs.filenamePattern, 'i').test(fileName)
  );

  console.log('fileNameAndHashMatch ->', fileNameAndHashMatch);

  if (fileNameAndHashMatch) {
    return fileNameAndHashMatch;
  }

  return mappingsByFilename.find(
    (attribs) =>
      !attribs.textureDefsHash &&
      new RegExp(attribs.filenamePattern, 'i').test(fileName)
  );
}
