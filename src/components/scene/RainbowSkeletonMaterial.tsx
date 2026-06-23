import { shaderMaterial } from '@react-three/drei';
import { extend, ThreeElements, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import React, { useRef } from 'react';

type RainbowSkeletonMaterialProps = ThreeElements['shaderMaterial'] & {
  uDepthSensitivity?: number;
  uColorSpeed?: number;
};

// Declare the custom element
declare module '@react-three/fiber' {
  interface ThreeElements {
    rainbowSkeletonMaterial: RainbowSkeletonMaterialProps;
  }
}

const vertexShader = `
  varying vec3 vPosition;
  varying float vDepth;
  void main() {
    vPosition = position;
    vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
    vDepth = -modelViewPosition.z;
    gl_Position = projectionMatrix * modelViewPosition;
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform float uDepthSensitivity;
  uniform float uColorSpeed;
  varying vec3 vPosition;
  varying float vDepth;

  vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xyz, 0.0, 1.0), c.y);
  }

  void main() {
    float depthFactor = clamp(vDepth / uDepthSensitivity, 0.0, 1.0);
    float hue = fract((vPosition.x + vPosition.y + vPosition.z) * 0.002 + uTime * uColorSpeed);
    
    // Adjust these values for more pastel colors
    float saturation = 0.3; // Lowered from 0.7
    float value = 0.95; // Increased from 1.0
    
    vec3 color = hsv2rgb(vec3(hue, saturation, value));
    
    // Soften the depth effect
    color = mix(color, vec3(1.0), depthFactor * 0.3);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

type RainbowSkeletonMaterialUniforms = {
  uTime: number;
  uDepthSensitivity: number;
  uColorSpeed: number;
};

const RainbowSkeletonMaterial = shaderMaterial(
  {
    uTime: 0,
    uDepthSensitivity: 0.005,
    uColorSpeed: 1
  },
  vertexShader,
  fragmentShader
);

extend({ RainbowSkeletonMaterial });

function RainbowSkeletonMaterialComponent({
  uDepthSensitivity = 0.005,
  uColorSpeed = 0.75,
  ...materialProps
}: RainbowSkeletonMaterialProps) {
  const materialRef = useRef<
    THREE.ShaderMaterial & RainbowSkeletonMaterialUniforms
  >(null);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uTime = clock.getElapsedTime();
      materialRef.current.needsUpdate = true;
    }
  });

  return (
    <rainbowSkeletonMaterial
      ref={materialRef}
      attach='material'
      uDepthSensitivity={uDepthSensitivity}
      uColorSpeed={uColorSpeed}
      {...materialProps}
    />
  );
}

export default RainbowSkeletonMaterialComponent;
