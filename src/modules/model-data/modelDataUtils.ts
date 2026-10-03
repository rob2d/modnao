export function getTextureHslScopeKey(
  textureIndex: number,
  uvPixelByteIndexes: number[] | undefined
) {
  if (!uvPixelByteIndexes?.length) {
    return `${textureIndex}:full`;
  }

  return `${textureIndex}:uv:${uvPixelByteIndexes.join(',')}`;
}
