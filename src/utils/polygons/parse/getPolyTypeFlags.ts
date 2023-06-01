const getPolyTypeFlags = (v: number): PolyTypeFlags => ({
  culling: ((v >> 1) & 1) == 1,
  cullingType: ((v >> 0) & 1) == 1 ? 'back' : 'front',
  spriteQuad: ((v >> 2) & 1) == 1,
  triangles: ((v >> 3) & 1) == 1,
  strip: ((v >> 4) & 1) == 1,
  superVertexIndex: ((v >> 5) & 1) == 1,
  gouradShading: ((v >> 6) & 1) == 1,
  reuseGlobalParams: ((v >> 7) & 1) == 1,
  envMaps: ((v >> 8) & 1) == 1
});

export default getPolyTypeFlags;
