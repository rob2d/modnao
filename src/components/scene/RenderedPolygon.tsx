import React, { useMemo, useRef, MutableRefObject } from 'react';
import { Mesh } from 'three';
import { NLPolygon } from '@/store/stageDataSlice';
import { Signal } from '@preact/signals-react';
import { Color } from '@react-three/fiber';

export default function RenderedPolygon({
  vertexGroupMode,
  vertexes,
  color
}: NLPolygon & { color: Signal<Color> }) {
  const meshRef = useRef() as MutableRefObject<Mesh>;

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

  if (meshRef?.current !== undefined) {
    return null;
  }

  return (
    <mesh ref={meshRef}>
      <meshBasicMaterial color={color.value} wireframe wireframeLinewidth={1} />
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
