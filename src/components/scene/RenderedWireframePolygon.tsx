import { useMemo } from 'react';
import { Vector3 } from 'three';
import { extend } from '@react-three/fiber';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
extend({ Line2, LineMaterial, LineGeometry });

type Props = {
  vertices: NLVertex[];
  indices: Uint16Array;
  color: React.CSSProperties['color'];
  lineWidth: number;
};

export default function RenderedWireframePolygon({
  vertices,
  indices,
  lineWidth,
  color
}: Props) {
  const geometry = useMemo(() => {
    const geom = new LineGeometry();
    const vPoints: number[] = [];
    indices.forEach((i) => {
      vPoints.push(...vertices[i].position);
    });

    const triPoints: number[] = [];

    for (let i = 0; i < vPoints.length; i += 9) {
      const v1 = new Vector3(vPoints[i], vPoints[i + 1], vPoints[i + 2]);
      const v2 = new Vector3(vPoints[i + 3], vPoints[i + 4], vPoints[i + 5]);
      const v3 = new Vector3(vPoints[i + 6], vPoints[i + 7], vPoints[i + 8]);

      // Connect the vertices of the triangle
      triPoints.push(v1.x, v1.y, v1.z);
      triPoints.push(v2.x, v2.y, v2.z);

      triPoints.push(v2.x, v2.y, v2.z);
      triPoints.push(v3.x, v3.y, v3.z);

      triPoints.push(v3.x, v3.y, v3.z);
      triPoints.push(v1.x, v1.y, v1.z);
    }
    geom.setPositions(triPoints);
    return geom;
  }, [vertices]);

  return (
    <line2 geometry={geometry}>
      <lineMaterial color={color} linewidth={lineWidth / 1000} />
    </line2>
  );
}
