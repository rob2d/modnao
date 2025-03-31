import { ThreeElement } from '@react-three/fiber';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';

declare module '@react-three/fiber' {
  interface ThreeElements {
    line2: ThreeElement<typeof Line2>;
    lineMaterial: ThreeElement<typeof LineMaterial>;
    lineGeometry: ThreeElement<typeof LineGeometry>;
  }
}
