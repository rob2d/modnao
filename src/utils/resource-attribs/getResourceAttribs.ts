import resourceAttribMappings from '@/constants/resourceAttribMappings';

export default function getResourceAttribs(hash: string, fileName: string) {
  if (!resourceAttribMappings[hash]) {
    return undefined;
  }

  const hasResourceAttribs = new RegExp(
    resourceAttribMappings[hash].filenamePattern,
    'i'
  ).test(fileName);

  return hasResourceAttribs ? resourceAttribMappings[hash] : undefined;
}
