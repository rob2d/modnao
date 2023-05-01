import { Color, ThreeEvent } from '@react-three/fiber';
import {
  useSignal,
  useComputed,
  Signal,
  effect,
  ReadonlySignal
} from '@preact/signals-react';
import { NLMesh } from '@/store/stageDataSlice';
import RenderedPolygon from './RenderedPolygon';

type RenderedMeshProps = {
  index: number;
  selectedIndex: Signal<number>;
} & NLMesh;

export default function RenderedMesh({
  index,
  polygons,
  selectedIndex
}: RenderedMeshProps) {
  const isHovered = useSignal(false);

  const color: ReadonlySignal<Color> = useComputed(() => {
    //if (selectedIndex.value === index) {
    return 0xff0000;
    //}
    //return isHovered.value === index ? 0x00ff00 : 0x0000ff;
  });

  effect(() => {
    console.log('color ->', color.value);
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    selectedIndex.value = index;
  };

  return (
    <mesh
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        console.log('onPointerOver', {
          index,
          isHovered: isHovered.value
        });
        isHovered.value = true;
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        console.log('onPointerOut', {
          index,
          isHovered: isHovered.value
        });
        isHovered.value = false;
      }}
    >
      {polygons.map((p, i) => (
        <RenderedPolygon {...p} color={color} key={`${index}_${i}`} />
      ))}
    </mesh>
  );
}
