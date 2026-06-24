import type { ThreeElements } from '@react-three/fiber';
import { useMemo } from 'react';
import { ShaderMaterial } from 'three';

const vertexShader = `
  varying vec4 vColor;
  void main() {
    vColor = color;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
varying vec4 vColor;

void main() {
  vec3 finalColor = clamp(vColor.rgb, 0.0, 1.0);
  gl_FragColor = vec4(finalColor, 1.0);
}
`;

export default function VertexColorShaderMaterial(
  props: Partial<ThreeElements['meshBasicMaterial']>
) {
  const vertexMeshColorShaderMaterial = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        vertexColors: true
      }),
    []
  );

  return (
    <primitive
      object={vertexMeshColorShaderMaterial}
      attach='material'
      {...props}
    />
  );
}
