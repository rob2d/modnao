import { useMemo } from 'react';
import { extend } from '@react-three/fiber';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
extend({ Line2, LineMaterial, LineGeometry });

type Props = {
  vertices: NLVertex[];
  triIndices: number[];
  color: React.CSSProperties['color'];
  lineWidth: number;
};

export default function RenderedWireframePolygon({
  vertices,
  triIndices,
  lineWidth,
  color
}: Props) {
  const geometry = useMemo(() => {
    const geom = new LineGeometry();
    const triPoints: number[] = [];
    triIndices.forEach((i) => {
      const vPositions = vertices[i].position;
      triPoints.push(vPositions[0], vPositions[1], vPositions[2]);
    });

    geom.setPositions(triPoints);
    return geom;
  }, [vertices]);

  return (
    <line2 geometry={geometry}>
      <lineMaterial color={color} linewidth={lineWidth * 0.00025} />
    </line2>
  );
}
