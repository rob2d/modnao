import { ThreeEvent } from '@react-three/fiber';
import React, { useCallback, useState } from 'react';
import RenderedPolygon, { NLPolygon } from './RenderedPolygon';

export type NLMesh = {
  index: number;
  polygons: NLPolygon[];
};

type RenderedMeshProps = {
  onClick: (e: ThreeEvent<MouseEvent>) => boolean;
  isSelected: boolean;
} & NLMesh;

export default function RenderedMesh({
  index,
  polygons,
  isSelected,
  onClick
}: RenderedMeshProps) {
  const [isHovered, setHovered] = useState(() => false);

  const onPointerOver = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setHovered(true);
  }, []);

  const onPointerOut = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setHovered(false);
  }, []);

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      isHovered && onClick(e);
    },
    [isHovered, onClick]
  );

  let color: number;

  if (isSelected) {
    color = 0xff00cd;
  } else {
    color = isHovered ? 0x771833 : 0x000000;
  }

  return (
    <mesh onClick={handleClick}>
      {polygons.map((p, i) => (
        <RenderedPolygon
          {...p}
          key={`${index}_${i}`}
          isSelected={isSelected}
          color={color}
        />
      ))}
    </mesh>
  );
}
