import { ThreeEvent } from '@react-three/fiber';
import { Signal, batch, useComputed, useSignal } from '@preact/signals-react';
import RenderedPolygon from './RenderedPolygon';
import { useCallback } from 'react';

// @TODO: centralize colors within theme

type RenderedMeshProps = {
  index: number;
  selectedIndex: Signal<number>;
} & NLMesh;

export default function RenderedMesh({
  index,
  polygons,
  selectedIndex
}: RenderedMeshProps) {
  /**
   * R3F nodes have to be recomputed
   * so this is a simple counter to
   * update the in batch calls
   */
  const invalidate = useSignal(0);
  const isHovered = useSignal(false);
  const isSelected = useComputed(() => index === selectedIndex.value);

  // @ TODO: use centralized theme
  const color = useComputed(() => {
    if (isSelected.value) {
      return 0xdd0077;
    }
    return isHovered.value ? 0x999999 : 0xcccccc;
  });

  /**
   * R3F has a quirk where we need to explicitly
   * invalidate objects and meshes with keys or
   * data becomes undrawable, so this render hash
   * just gets aggregate of unique signals needed
   * so that we know we are drawing after all signals
   * update
   */
  const renderHash = useComputed(
    () =>
      `${index}-${selectedIndex.value}-${isSelected.value}-${isHovered.value}-${invalidate.value}`
  );

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    batch(() => {
      invalidate.value++;
      selectedIndex.value = index;
    });
  }, []);

  const onPointerOver = useCallback(() => {
    batch(() => {
      isHovered.value = true;
      invalidate.value++;
    });
  }, []);

  const onPointerOut = useCallback(() => {
    batch(() => {
      isHovered.value = false;
      invalidate.value++;
    });
  }, []);

  return (
    <mesh
      key={`m${renderHash}`}
      onClick={handleClick}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      {polygons.map((p, pIndex) => (
        <RenderedPolygon
          {...p}
          color={color.value}
          isSelected={isSelected.value}
          isHovered={isHovered.value}
          key={`p-${pIndex}-${renderHash.value}`}
          index={pIndex}
        />
      ))}
    </mesh>
  );
}
