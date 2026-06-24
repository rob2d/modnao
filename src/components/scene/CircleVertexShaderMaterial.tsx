import { type ThreeElements, useFrame, useThree } from '@react-three/fiber';
import { useMemo } from 'react';
import { ShaderMaterial, Vector3 } from 'three';

const circleFragmentShader = `
  varying vec4 vColor;
  varying float vDistance; // The distance to the camera
  uniform float pointSize; // To access the point size

  void main() {
    // Get the distance from the center of the point
    float dist = distance(gl_PointCoord, vec2(0.5));

    // Define the radius of the circle based on the point size
    float radius = 0.5;

    // Outline thickness
    float outlineThickness = 0.275;

    // Compute alpha based on the distance to the camera (closer = more opaque)
    float alpha = 1.0 - smoothstep(0.0, 5000.0, vDistance); // Adjusted max distance

    // Clamp alpha to make sure it doesn't go below a visible threshold (e.g., 0.1)
    alpha = max(alpha, 0.01); // Avoid making it fully transparent

    // Invert the fill color for the outline
    vec3 invertedColor = vec3(1.0) - vColor.rgb; // Invert the RGB components for outline

    // Check if the current fragment is within the outline thickness
    if (dist > radius) discard; // Outside the circle
    else if (dist > radius - outlineThickness) {
      gl_FragColor = vec4(vColor.rgb, alpha); // Inverted outline color with dynamic alpha
    } else {
      gl_FragColor = vec4(invertedColor, 0.03); // Fill color with dynamic alpha
    }
  }
`;

// Circle Shader for points
const circleVertexShader = `
  varying vec4 vColor;
  varying float vDistance; // Pass the distance to the fragment shader
  uniform float pointSize; // To access the point size

  void main() {
    vColor = color;

    // Calculate the distance from the vertex position to the camera position
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vDistance = length(worldPosition.xyz - cameraPosition); // Compute distance to camera

    gl_PointSize = pointSize; // Set the point size dynamically
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export default function CircleVertexShaderMaterial(
  props: Partial<ThreeElements['meshBasicMaterial']>
) {
  const { camera } = useThree();
  const circleVertexShaderMaterial = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          pointSize: { value: 16.0 },
          cameraPosition: { value: new Vector3() }
        },
        vertexShader: circleVertexShader,
        fragmentShader: circleFragmentShader,
        vertexColors: true,
        depthTest: false,
        depthWrite: false,
        transparent: true
      }),
    []
  );

  useFrame(() => {
    circleVertexShaderMaterial.uniforms.cameraPosition.value.copy(
      camera.position
    );
  });

  return (
    <primitive
      attach='material'
      object={circleVertexShaderMaterial}
      {...props}
    />
  );
}
