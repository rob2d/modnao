import '@react-three/fiber';
import React, { useMemo, useRef, useEffect, MutableRefObject } from 'react';
import { Mesh } from 'three';

export type Vertex = {
  position: [x: number, y: number, z: number];
};

export type NLPolygon = {
  index: number;
  vertexes: Vertex[];
  vertexGroupMode: string;
};

type RenderedPolygonProps = {
  isSelected: boolean;
  color: number;
} & NLPolygon;

export default function RenderedPolygon({
  isSelected,
  vertexes,
  vertexGroupMode,
  color
}: RenderedPolygonProps) {
  const meshRef = useRef() as MutableRefObject<Mesh>;

  useEffect(() => {
    if (!meshRef.current) {
      return;
    }

    const { geometry } = meshRef.current;
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
  }, [vertexes]);

  const [vertices, indices] = useMemo(() => {
    const vArray: number[] = [];
    const iArray: number[] = [];

    if (vertexGroupMode === 'regular') {
      vertexes.forEach((v, i) => {
        vArray.push(...v.position);
        iArray.push(i);

        if (i + 1 < vertexes.length) {
          iArray.push(i + 1);
        }
        if (i + 2 < vertexes.length) {
          iArray.push(i + 2);
        }
      });
    } else {
      vertexes.forEach((v, i) => {
        vArray.push(...v.position);
        iArray.push(i);
      });
    }

    return [new Float32Array(vArray), new Uint16Array(iArray)];
  }, [vertexes, vertexGroupMode]);

  const colors = useMemo(
    () =>
      new Float32Array(
        vertexes.reduce((result: number[]) => {
          result.push(1, 1, 1);
          return result;
        }, [])
      ),
    [vertexes]
  );

  if (meshRef?.current !== undefined) {
    return null;
  }

  return (
    <mesh ref={meshRef}>
      <bufferGeometry attach={'geometry'}>
        <bufferAttribute
          attach='attributes-position'
          count={vertices.length / 3}
          array={vertices}
          itemSize={3}
        />
        <bufferAttribute
          attach='attributes-color'
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          array={indices}
          attach='index'
          count={indices.length}
          itemSize={1}
        />
      </bufferGeometry>
      <meshBasicMaterial
        wireframe
        vertexColors
        wireframeLinewidth={isSelected ? 3 : 1}
        color={color}
      />
    </mesh>
  );
}
