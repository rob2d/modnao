const getPolyTypeFlags = (v: number): PolyTypeFlags => ({
  frontFaceCulling: Boolean(v & 0b1),
  backFaceCulling: Boolean(v & 0b10),
  spriteQuad: Boolean(v & 0b100),
  triangles: Boolean(v & 0b1000),
  superVertexIndex: Boolean(v & 0b10000),
  gouradShading: Boolean(v & 0b100000),
  reuseGlobalParams: Boolean(v & 0b1000000),
  envMaps: Boolean(v & 0b10000000)
});

export default getPolyTypeFlags;
