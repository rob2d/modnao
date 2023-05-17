import React, { useMemo } from 'react';
import { Text } from '@react-three/drei';
import { DoubleSide, Texture } from 'three';

type Point3D = [x: number, y: number, z: number];

export default function RenderedPolygon({
  vertexGroupMode,
  vertexes,
  color,
  address,
  isSelected,
  index,
  texture,
  meshDisplayMode = 'textured'
}: NLPolygon & {
  color: string;
  isSelected: boolean;
  index: number;
  texture?: Texture;
  meshDisplayMode: 'wireframe' | 'textured';
}) {
  const [vertices, normals, uvs, indices, displayPosition] = useMemo(() => {
    let vArrayIndex = 0;
    let nArrayIndex = 0;
    let uvArrayIndex = 0;

    const vArray = new Float32Array(vertexes.length * 3);
    const nArray = new Float32Array(vertexes.length * 3);
    const iArray: number[] = [];
    const uvArray = new Float32Array(vertexes.length * 2);

    // display position is an aggregated weight
    // @TODO: precalculate
    let dArray: Point3D = [0, 0, 0];

    vertexes.forEach((v, i) => {
      v.position.forEach((v, i) => {
        vArray[vArrayIndex++] = v;
        dArray[i] += v;
      });

      nArray[nArrayIndex++] = v.normals[0];
      nArray[nArrayIndex++] = v.normals[1];
      nArray[nArrayIndex++] = v.normals[2];

      uvArray[uvArrayIndex++] = v.uv[0];
      uvArray[uvArrayIndex++] = v.uv[1];
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

    return [vArray, nArray, uvArray, new Uint16Array(iArray), dArray];
  }, [vertexes, vertexGroupMode]);

  const meshModeMaterialProps =
    meshDisplayMode === 'wireframe'
      ? {
          wireframe: true,
          wireframeLinewidth: isSelected ? 4 : 3
        }
      : {
          map: texture,
          side: DoubleSide,
          transparent: true,
          opacity: isSelected ? 0.75 : 1
        };

  return (
    <mesh key={address}>
      <meshBasicMaterial
        color={color}
        {...meshModeMaterialProps}
        key={meshDisplayMode}
      />
      {!isSelected || meshDisplayMode === 'textured' ? undefined : (
        <Text
          font={'/fonts/robotoLightRegular.json'}
          color={color}
          fontSize={30}
          position={displayPosition}
        >
          [{index}] {`0x${address.toString(16)}`}
        </Text>
      )}
      <bufferGeometry attach={'geometry'}>
        <bufferAttribute
          attach='attributes-position'
          count={vertices.length / 3}
          array={vertices}
          itemSize={3}
        />
        <bufferAttribute
          attach='attributes-uv'
          count={uvs.length / 2}
          array={uvs}
          itemSize={2}
        />
        <bufferAttribute
          attach='attributes-normal'
          count={normals.length / 3}
          array={normals}
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
