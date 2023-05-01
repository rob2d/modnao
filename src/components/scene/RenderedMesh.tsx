import { ThreeEvent, invalidate, useFrame } from '@react-three/fiber';
import { Signal } from '@preact/signals-react';
import { NLMesh } from '@/store/stageDataSlice';
import RenderedPolygon from './RenderedPolygon';
import { MutableRefObject, useRef } from 'react';
import { Color } from 'three';

type RenderedMeshProps = {
  index: number;
  selectedIndex: Signal<number>;
} & NLMesh;

export default function RenderedMesh({
  index,
  polygons,
  selectedIndex
}: RenderedMeshProps) {
  // we use a mutable ref for hovered & color since
  // state or signals create race conditions with pointer event
  // frequency in component lifecycle + R3F
  const isHovered = useRef(false);
  const color: MutableRefObject<Color> = useRef(new Color(0xff0000));

  useFrame(() => {
    if (selectedIndex.value === index) {
      color.current = new Color(0x0000ff);
      return;
    }
    color.current = new Color(isHovered.current ? 0xff0000 : 0x00ff00);
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    selectedIndex.value = index;
    invalidate();
  };

  return (
    <mesh
      onClick={handleClick}
      onPointerEnter={(e) => {
        e.stopPropagation();
        isHovered.current = true;
      }}
      onPointerLeave={(e) => {
        isHovered.current = false;
      }}
    >
      {polygons.map((p, i) => (
        <RenderedPolygon {...p} color={color} key={`${index}_${i}`} />
      ))}
    </mesh>
  );
}
