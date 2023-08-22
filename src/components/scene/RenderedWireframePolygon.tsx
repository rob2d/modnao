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
    const vPositions: NLPoint3D[] = [];
    indices.forEach((i) => {
      vPositions.push(vertices[i].position);
    });

    const triPoints: number[] = [];

    for (let i = 0; i < vPositions.length - 2; i++) {
      const v1 = vPositions[i];
      const v2 = vPositions[i + 1];
      const v3 = vPositions[i + 2];

      // Connect the vertices of the triangle
      triPoints.push(v1[0], v1[1], v1[2]);
      triPoints.push(v2[0], v2[1], v2[2]);
      triPoints.push(v3[0], v3[1], v3[2]);
      triPoints.push(v1[0], v1[1], v1[2]);
    }

    geom.setPositions(triPoints);
    return geom;
  }, [vertices]);

  return (
    <line2 geometry={geometry}>
      <lineMaterial color={color} linewidth={lineWidth * 0.00025} />
    </line2>
  );
}
