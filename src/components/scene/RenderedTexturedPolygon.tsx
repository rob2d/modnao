import { MeshBasicMaterialProps } from '@react-three/fiber';

type Props = {
  vertexPositions: Float32Array;
  indices: Uint16Array;
  normals: Float32Array;
  uvs: Float32Array;
  materialProps: Partial<MeshBasicMaterialProps>;
};

export default function RenderedTexturePolygon({
  vertexPositions,
  uvs,
  normals,
  indices,
  materialProps
}: Props) {
  return (
    <>
      <meshBasicMaterial attach='material' {...materialProps} />
      <bufferGeometry attach='geometry'>
        <bufferAttribute
          attach='attributes-position'
          count={vertexPositions.length / 3}
          array={vertexPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach='attributes-uv'
          count={uvs.length / 2}
          array={uvs}
          itemSize={2}
        />
        <bufferAttribute
          attach='attributes-normal'
          count={normals.length / 3}
          array={normals}
          itemSize={3}
        />
        <bufferAttribute
          array={indices}
          attach='index'
          count={indices.length}
          itemSize={1}
        />
      </bufferGeometry>
    </>
  );
}
