import React, { useMemo, useRef, MutableRefObject } from 'react';
import { Mesh, MeshBasicMaterial } from 'three';
import { NLPolygon } from '@/store/stageDataSlice';
import { Color } from 'three';
import { useFrame } from '@react-three/fiber';

export default function RenderedPolygon({
  vertexGroupMode,
  vertexes,
  color
}: NLPolygon & { color: MutableRefObject<Color> }) {
  const meshRef = useRef() as MutableRefObject<Mesh>;
  const materialRef = useRef() as MutableRefObject<MeshBasicMaterial>;

  // TODO: use preact/signal and computed here
  // for same effect and potential DOM optimization
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

  // color must be updated manually with a mutable
  // ref in each render because of a quirk in
  // react-three/threejs fiber with race condition
  // when we use either state or signals (unfortunately)
  // @TODO: investigate and then post issue on r3f repo
  useFrame(() => {
    if (!materialRef.current) {
      return;
    }
    materialRef.current.color = color.current;
  });

  if (meshRef?.current !== undefined) {
    return null;
  }

  return (
    <mesh ref={meshRef}>
      <meshBasicMaterial wireframe ref={materialRef} color={color.current} />
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
