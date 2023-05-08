import React, { useMemo } from 'react';
import { Text } from '@react-three/drei';

type Point3D = [x: number, y: number, z: number];

export default function RenderedPolygon({
  vertexGroupMode,
  vertexes,
  color,
  address,
  isSelected,
  index
}: NLPolygon & {
  color: string;
  isSelected: boolean;
  index: number;
}) {
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

  const lineWidth = isSelected ? 3 : 2;

  return (
    <mesh key={address}>
      {!isSelected ? undefined : (
        <Text
          font={'/fonts/robotoLightRegular.json'}
          color={color}
          fontSize={isSelected ? 24 : 16}
          position={displayPosition}
        >
          [{index}] {`0x${address.toString(16)}`}
        </Text>
      )}
      <meshBasicMaterial
        wireframe
        wireframeLinewidth={lineWidth}
        color={color}
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
  );
}
