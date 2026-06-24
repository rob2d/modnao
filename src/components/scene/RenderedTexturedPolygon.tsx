import { SceneOptions } from '@/contexts/SceneOptionsContext';
import { ThreeElements } from '@react-three/fiber';
import CircleVertexShaderMaterial from './CircleVertexShaderMaterial';
import VertexColorShaderMaterial from './VertexColorShaderMaterial';

type Props = {
  vertexPositions: Float32Array;
  indices: Uint16Array;
  colors: Float32Array;
  normals: Float32Array;
  uvs: Float32Array;
  materialProps: Partial<ThreeElements['meshBasicMaterial']>;
  sceneOptions: SceneOptions;
  vertexSelectionMode: boolean;
};

export default function RenderedTexturePolygon({
  vertexPositions,
  uvs,
  normals,
  indices,
  colors,
  materialProps,
  sceneOptions,
  vertexSelectionMode
}: Props) {
  const colorsRendered = sceneOptions.enableVertexColors || vertexSelectionMode;

  return (
    <>
      {vertexSelectionMode ? (
        <VertexColorShaderMaterial side={materialProps.side} />
      ) : (
        <meshBasicMaterial
          attach='material'
          vertexColors={sceneOptions.enableVertexColors}
          {...materialProps}
        />
      )}
      <bufferGeometry attach='geometry'>
        {/* Fixed bufferAttributes */}
        <bufferAttribute
          attach='attributes-position'
          args={[vertexPositions, 3]}
        />
        <bufferAttribute attach='attributes-uv' args={[uvs, 2]} />
        <bufferAttribute attach='attributes-normal' args={[normals, 3]} />

        {colorsRendered ? (
          <bufferAttribute attach='attributes-color' args={[colors, 4]} />
        ) : undefined}

        {/* Fixed index buffer */}
        <bufferAttribute attach='index' args={[indices, 1]} />
      </bufferGeometry>

      {vertexSelectionMode ? (
        <points>
          <CircleVertexShaderMaterial side={materialProps.side} />
          <bufferGeometry attach='geometry'>
            <bufferAttribute
              attach='attributes-position'
              args={[vertexPositions, 3]}
            />
            <bufferAttribute attach='attributes-color' args={[colors, 4]} />
          </bufferGeometry>
        </points>
      ) : undefined}
    </>
  );
}
