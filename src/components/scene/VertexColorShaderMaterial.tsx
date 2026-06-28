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
  vec4 shadedColor = vec4(
    clamp(vColor.rgb, 0.0, 1.0),
    clamp(vColor.a, 0.0, 1.0)
  );

  gl_FragColor = shadedColor;
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
        vertexColors: true,
        transparent: true
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
