import { Texture } from 'three';
import RenderedPolygon from './RenderedPolygon';

type RenderedMeshProps = {
  objectKey: string;
  selectedObjectKey?: string;
  objectSelectionType: 'mesh' | 'polygon';
  onSelectObjectKey: (key: string) => void;
  texture: Texture | null;
} & NLMesh;

export default function RenderedMesh({
  objectKey,
  polygons,
  selectedObjectKey,
  onSelectObjectKey,
  objectSelectionType,
  texture
}: RenderedMeshProps) {
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
