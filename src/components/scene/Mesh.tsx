import { ThreeEvent } from '@react-three/fiber';
import React, { useCallback, useState } from 'react';
import PolygonMesh, { Polygon } from './PolygonMesh';

type MeshProps = {
  index: number;
  onClick: (e: ThreeEvent<MouseEvent>) => boolean;
  polygons: Polygon[];
  isSelected: boolean;
};

export default function Mesh({
  index,
  polygons,
  isSelected,
  onClick
}: MeshProps) {
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
    <mesh
      onClick={handleClick}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      {polygons.map((p, i) => (
        <PolygonMesh
          {...p}
          key={`${index}_${i}`}
          isSelected={isSelected}
          color={color}
        />
      ))}
    </mesh>
  );
}
