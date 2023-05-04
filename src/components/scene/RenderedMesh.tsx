import { ThreeEvent } from '@react-three/fiber';
import {
  ReadonlySignal,
  Signal,
  batch,
  useComputed,
  useSignal
} from '@preact/signals-react';
import RenderedPolygon from './RenderedPolygon';
import { useCallback } from 'react';
import { useTheme } from '@mui/material';

// @TODO: centralize colors within theme

type RenderedMeshProps = {
  index: number;
  selectedSceneIndex: Signal<number>;
} & NLMesh;

export default function RenderedMesh({
  index,
  polygons,
  selectedSceneIndex
}: RenderedMeshProps) {
  const theme = useTheme();
  /**
   * R3F nodes have to be recomputed
   * so this is a simple counter to
   * update the in batch calls
   */
  const invalidate = useSignal(0);
  const isHovered = useSignal(false);
  const isSelected = useComputed(() => index === selectedSceneIndex.value);

  const color = useComputed(() => {
    if (isSelected.value) {
      return theme.palette.sceneMesh.selected;
    }
    return isHovered.value
      ? theme.palette.sceneMesh.highlighted
      : theme.palette.sceneMesh.default;
  }) as ReadonlySignal<string>;

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
      `${index}-${selectedSceneIndex.value}-${isSelected.value}-${isHovered.value}-${invalidate.value}`
  );

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    batch(() => {
      invalidate.value++;
      selectedSceneIndex.value = index;
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
