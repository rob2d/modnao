import { ThreeEvent } from '@react-three/fiber';
import React, { useState } from 'react';
import Polygon, { Vertex } from './Polygon';

type PolygonDataPoint = { 
  index: number, 
  vertexes: Vertex[];
  vertexGroupMode: string;
};

type MeshProps = {
    index: number, 
    onClick: (e: ThreeEvent<MouseEvent>) => boolean, 
    polygons: PolygonDataPoint[], 
    isSelected: boolean
};
  

export default function Mesh({ index, onClick, polygons, isSelected }: MeshProps) {
  const [isHovered, setHovered] = useState(() => false);

  let color: number;
  
  if(isSelected) {
    color = 0xFF00CD;
  } else {
    color = isHovered ? 0x771833 : 0x000000;
  }

  return (
    <mesh
      onClick={ (e) => isHovered && onClick(e) }
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
      }}
    >
      { polygons.map((p, i) => (
        <Polygon
          {...p}
          key={`${index}_${i}`}
          isSelected={isSelected}
          color={color}     
        />
      )) }
    </mesh>
  );
}