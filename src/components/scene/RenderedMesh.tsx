import { ThreeEvent } from '@react-three/fiber';
import RenderedPolygon from './RenderedPolygon';
import { useTheme } from '@mui/material';
import { NLTextureDef } from '@/types/NLAbstractions';
import { useTexture } from '@react-three/drei';
import { RepeatWrapping } from 'three';

type RenderedMeshProps = {
  index: number;
  objectIndex: number;
  onSelectObjectIndex: (index: number) => void;
  textureDefs: NLTextureDef[];
} & NLMesh;

const transparent1x1 = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==`;

export default function RenderedMesh({
  index,
  polygons,
  objectIndex,
  onSelectObjectIndex,
  textureNumber,
  textureDefs
}: RenderedMeshProps) {
  const theme = useTheme();
  const texture = useTexture(
    textureDefs?.[textureNumber]?.dataUrl || transparent1x1
  );
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  const isSelected = index === objectIndex;
  const { sceneMesh: colors } = theme.palette;
  const color = isSelected ? colors.selected : colors.default;

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelectObjectIndex(objectIndex !== index ? index : -1);
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
          texture={texture}
        />
      ))}
    </mesh>
  );
}
