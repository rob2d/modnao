import { SceneOptions } from '@/contexts/SceneOptionsContext';
import { ThreeElements } from '@react-three/fiber';
import RainbowSkeletonMaterial from './RainbowSkeletonMaterial';

type Props = {
  vertexPositions: Float32Array;
  indices: Uint16Array;
  colors: Float32Array;
  normals: Float32Array;
  uvs: Float32Array;
  materialProps: Partial<ThreeElements['meshBasicMaterial']>;
  sceneOptions: SceneOptions;
};

export default function RenderedTexturePolygon({
  vertexPositions,
  uvs,
  normals,
  indices,
  colors,
  materialProps,
  sceneOptions
}: Props) {
  return (
    <>
      {sceneOptions.enableVertexColors ? (
        <RainbowSkeletonMaterial side={materialProps.side} />
      ) : (
        <meshBasicMaterial attach='material' {...materialProps} />
      )}
      <bufferGeometry attach='geometry'>
        {/* Fixed bufferAttributes */}
        <bufferAttribute
          attach='attributes-position'
          args={[vertexPositions, 3]}
        />
        <bufferAttribute attach='attributes-uv' args={[uvs, 2]} />
        <bufferAttribute attach='attributes-normal' args={[normals, 3]} />

        {sceneOptions.enableVertexColors ? (
          <bufferAttribute attach='attributes-color' args={[colors, 4]} />
        ) : undefined}

        {/* Fixed index buffer */}
        <bufferAttribute attach='index' args={[indices, 1]} />
      </bufferGeometry>
    </>
  );
}
