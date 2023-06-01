import ViewOptionsContext from '@/contexts/ViewOptionsContext';
import RenderedPolygon from './RenderedPolygon';
import { NLTextureDef } from '@/types/NLAbstractions';
import { useTexture } from '@react-three/drei';
import { ClampToEdgeWrapping, RepeatWrapping } from 'three';
import { useContext } from 'react';

type RenderedMeshProps = {
  objectKey: string;
  selectedObjectKey?: string;
  objectSelectionType: 'mesh' | 'polygon';
  onSelectObjectKey: (key: string) => void;
  textureDefs: NLTextureDef[];
} & NLMesh;

const transparent1x1 = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==`;

export default function RenderedMesh({
  objectKey,
  polygons,
  selectedObjectKey,
  onSelectObjectKey,
  objectSelectionType,
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

  return (
    <group>
      {polygons.map((p, pIndex) => {
        const key = `${objectKey}-${pIndex}`;
        return (
          <RenderedPolygon
            {...p}
            key={key}
            objectKey={objectSelectionType === 'mesh' ? objectKey : key}
            selectedObjectKey={selectedObjectKey}
            onSelectObjectKey={onSelectObjectKey}
            texture={texture}
          />
        );
      })}
    </group>
  );
}
