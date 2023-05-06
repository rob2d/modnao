import { ThreeEvent } from '@react-three/fiber';
import RenderedPolygon from './RenderedPolygon';
import { useTheme } from '@mui/material';

type RenderedMeshProps = {
  index: number;
  objectIndex: number;
  onSelectObjectIndex: (index: number) => void;
} & NLMesh;

export default function RenderedMesh({
  index,
  polygons,
  objectIndex,
  onSelectObjectIndex
}: RenderedMeshProps) {
  const theme = useTheme();
  const isSelected = index === objectIndex;
  const { sceneMesh } = theme.palette;
  const color = isSelected ? sceneMesh.selected : sceneMesh.default;

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelectObjectIndex(index);
  };

  return (
    <mesh onClick={handleClick}>
      {polygons.map((p, pIndex) => (
        <RenderedPolygon
          {...p}
          color={color as string}
          isSelected={isSelected}
          key={pIndex}
          index={pIndex}
        />
      ))}
    </mesh>
  );
}
