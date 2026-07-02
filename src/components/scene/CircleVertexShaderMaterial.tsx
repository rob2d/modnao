import { type ThreeElements, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import {
  Color,
  type ColorRepresentation,
  ShaderMaterial,
  Vector3
} from 'three';

const circleFragmentShader = `
  varying vec4 vColor;
  varying float vSelected;
  varying float vDistance; // The distance to the camera
  uniform float pointSize; // To access the point size
  uniform vec3 selectedColor;
  uniform float colorEditable;

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
    float editable = step(0.5, colorEditable);
    float editableAlphaScale = mix(0.45, 1.0, editable);
    float slashDistance = abs(gl_PointCoord.x + gl_PointCoord.y - 1.0);
    float slash = (1.0 - editable) *
      (1.0 - smoothstep(0.035, 0.075, slashDistance)) *
      smoothstep(0.16, 0.22, dist);
    vec3 slashColor = vec3(0.06);

    // Check if the current fragment is within the outline thickness
    if (dist > radius) discard; // Outside the circle
    else if (dist > radius - outlineThickness) {
      float outlineAlpha = vSelected > 0.5 ? vColor.a : alpha * editableAlphaScale;

      gl_FragColor = vec4(vColor.rgb, outlineAlpha); // Inverted outline color with dynamic alpha
    } else if (vSelected > 0.5) {
      float centerRadius = radius - outlineThickness;
      float glowStrength = 1.0 - smoothstep(0.0, centerRadius, dist);
      vec3 glowColor = mix(selectedColor, vec3(1.0), glowStrength * 0.45);

      gl_FragColor = vec4(glowColor, vColor.a * mix(0.7, 1.0, editable));
    } else {
      gl_FragColor = vec4(invertedColor, 0.03 * editableAlphaScale); // Fill color with dynamic alpha
    }

    if (slash > 0.0) {
      gl_FragColor = mix(
        gl_FragColor,
        vec4(slashColor, max(gl_FragColor.a, 0.95)),
        slash
      );
    }
  }
`;

const circleVertexShader = `
  attribute float selected;
  varying vec4 vColor;
  varying float vSelected;
  varying float vDistance; // Pass the distance to the fragment shader
  uniform float pointSize; // To access the point size

  void main() {
    vColor = color;
    vSelected = selected;

    // Calculate the distance from the vertex position to the camera position
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vDistance = length(worldPosition.xyz - cameraPosition); // Compute distance to camera

    gl_PointSize = pointSize; // Set the point size dynamically
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

interface CircleVertexShaderMaterialProps extends Partial<
  ThreeElements['meshBasicMaterial']
> {
  colorEditable: boolean;
  selectedColor: ColorRepresentation;
}

export default function CircleVertexShaderMaterial({
  colorEditable,
  selectedColor,
  ...props
}: CircleVertexShaderMaterialProps) {
  const { camera } = useThree();
  const circleVertexShaderMaterial = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          pointSize: { value: 16.0 },
          colorEditable: { value: colorEditable ? 1 : 0 },
          cameraPosition: { value: new Vector3() },
          selectedColor: { value: new Color(selectedColor) }
        },
        vertexShader: circleVertexShader,
        fragmentShader: circleFragmentShader,
        vertexColors: true,
        depthTest: false,
        depthWrite: false,
        transparent: true
      }),
    [colorEditable]
  );

  useEffect(() => {
    circleVertexShaderMaterial.uniforms.selectedColor.value.set(selectedColor);
  }, [circleVertexShaderMaterial, selectedColor]);

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
