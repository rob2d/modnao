import { MeshBasicMaterialProps } from '@react-three/fiber';
import { ShaderMaterial } from 'three';

const vertexShader = `
  varying vec4 vColor;
  void main() {
    vColor = color;
    gl_PointSize = pointSize; // Set the size of the points
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * Computes transparency based on proximity to white and vertex alpha,
 * and sets the final color with computed transparency.
 * This effect is independent of viewing direction.
 * Also applies a black outline effect based on color differences.
 */
/**
 * Computes transparency based on proximity to white and vertex alpha,
 * and sets the final color with computed transparency.
 * This effect is independent of viewing direction.
 * Adds a black outline around polygons without affecting transparency.
 */
const fragmentShader = `
varying vec4 vColor;

void main() {
  // Calculate the proximity to white (1.0, 1.0, 1.0) based on RGB distance.
  float proximityToWhite = 1.0 - length(vColor.rgb - vec3(1.0));
  // Ensure all color values are clamped to the [0.0, 1.0] range
  finalColor = clamp(vColor.rgb, 0.0, 1.0);

  // Set the final color with full opacity (no transparency).
  gl_FragColor = vec4(vColor.rgb, 1.0); // Ensure alpha is 1.0 for full opacity
}
`;

const vertexMeshColorShaderMaterial = new ShaderMaterial({
  vertexShader,
  fragmentShader,
  vertexColors: true
});

export default function VertexColorShaderMaterial(
  props: Partial<MeshBasicMaterialProps>
) {
  return (
    <primitive
      object={vertexMeshColorShaderMaterial}
      attach='material'
      {...props}
    />
  );
}
