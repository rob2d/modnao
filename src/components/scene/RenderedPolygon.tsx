import React, { useMemo, useRef, MutableRefObject } from 'react';
import { Mesh } from 'three';
import { NLPolygon } from '@/store/stageDataSlice';
import { Text } from '@react-three/drei';

type Point3D = [x: number, y: number, z: number];

export default function RenderedPolygon({
  vertexGroupMode,
  vertexes,
  color,
  address,
  isSelected,
  isHovered,
  index
}: NLPolygon & {
  color: number;
  isSelected: boolean;
  isHovered: boolean;
  index: number;
}) {
  const meshRef = useRef() as MutableRefObject<Mesh>;

  // @TODO: use preact/signal and computed here
  // for same effect and potential DOM optimization
  const [vertices, indices, displayPosition] = useMemo(() => {
    const vArray: number[] = [];
    const iArray: number[] = [];

    // display position is an aggregated weight
    // @TODO: precalculate
    let dArray: Point3D = [0, 0, 0];

    vertexes.forEach((v, i) => {
      v.position.forEach((v, i) => {
        vArray.push(v);
        dArray[i] += v;
      });

      iArray.push(i);

      if (vertexGroupMode === 'regular') {
        if (i + 1 < vertexes.length) {
          iArray.push(i + 1);
        }
        if (i + 2 < vertexes.length) {
          iArray.push(i + 2);
        }
      }
    });

    dArray = dArray.map((c) => Math.round(c / vertexes.length)) as Point3D;

    return [new Float32Array(vArray), new Uint16Array(iArray), dArray];
  }, [vertexes, vertexGroupMode]);

  if (meshRef?.current !== undefined) {
    return null;
  }

  let lineWidth = 1;
  if (isSelected) {
    lineWidth = 3;
  } else if (isHovered) {
    lineWidth = 2;
  }

  return (
    <>
      <mesh
        ref={meshRef}
        key={`m${address}-${color}-${isHovered}-${isSelected}`}
      >
        <Text
          key={`mt${address}-${color}-${isHovered}-${isSelected}`}
          font={'/fonts/robotoLightRegular.json'}
          color={color}
          fontSize={isSelected ? 24 : 16}
          position={displayPosition}
        >
          [{index}] {`0x${address.toString(16)}`}
        </Text>
        <meshBasicMaterial
          wireframe
          wireframeLinewidth={lineWidth}
          color={color}
          key={`mtbm${address}-${color}`}
        />
        <bufferGeometry attach={'geometry'}>
          <bufferAttribute
            attach='attributes-position'
            count={vertices.length / 3}
            array={vertices}
            itemSize={3}
          />
          <bufferAttribute
            array={indices}
            attach='index'
            count={indices.length}
            itemSize={1}
          />
        </bufferGeometry>
      </mesh>
    </>
  );
}
