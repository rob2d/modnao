import { ThreeEvent } from '@react-three/fiber';
import RenderedPolygon from './RenderedPolygon';
import { useTheme } from '@mui/material';
import { NLTextureDef } from '@/types/NLAbstractions';
import { useTexture } from '@react-three/drei';
import { ClampToEdgeWrapping, RepeatWrapping } from 'three';

type RenderedMeshProps = {
  index: number;
  objectIndex: number;
  onSelectObjectIndex: (index: number) => void;
  textureDefs: NLTextureDef[];
  meshDisplayMode: 'wireframe' | 'textured';
} & NLMesh;

const transparent1x1 = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==`;

export default function RenderedMesh({
  index,
  meshDisplayMode,
  polygons,
  objectIndex,
  onSelectObjectIndex,
  textureWrappingFlags,
  textureNumber,
  textureDefs
}: RenderedMeshProps) {
  const theme = useTheme();
  const textureDef = textureDefs?.[textureNumber];
  const texture = useTexture(textureDef?.dataUrl || transparent1x1);

  texture.wrapS = textureWrappingFlags.hRepeat
    ? RepeatWrapping
    : ClampToEdgeWrapping;

  texture.wrapT = textureWrappingFlags.vRepeat
    ? RepeatWrapping
    : ClampToEdgeWrapping;

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
          meshDisplayMode={meshDisplayMode}
        />
      ))}
    </mesh>
  );
}
