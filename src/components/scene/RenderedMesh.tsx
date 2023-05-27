import { ThreeEvent } from '@react-three/fiber';
import RenderedPolygon from './RenderedPolygon';
import { NLTextureDef } from '@/types/NLAbstractions';
import { useTexture } from '@react-three/drei';
import { ClampToEdgeWrapping, RepeatWrapping } from 'three';

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
  textureWrappingFlags,
  textureIndex,
  textureDefs,
  isOpaque
}: RenderedMeshProps) {
  const textureDef = textureDefs?.[textureIndex];
  const texture = useTexture(
    textureDef?.dataUrls[isOpaque ? 'opaque' : 'translucent'] || transparent1x1
  );

  texture.wrapS = textureWrappingFlags.hRepeat
    ? RepeatWrapping
    : ClampToEdgeWrapping;

  texture.wrapT = textureWrappingFlags.vRepeat
    ? RepeatWrapping
    : ClampToEdgeWrapping;

  const isSelected = index === objectIndex;

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelectObjectIndex(objectIndex !== index ? index : -1);
  };

  return (
    <group onClick={handleClick}>
      {polygons.map((p, pIndex) => (
        <RenderedPolygon
          {...p}
          isSelected={isSelected}
          key={pIndex}
          index={pIndex}
          texture={texture}
        />
      ))}
    </group>
  );
}
