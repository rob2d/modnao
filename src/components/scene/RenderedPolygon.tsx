import React, { useContext, useMemo, useRef } from 'react';
import { Text } from '@react-three/drei';
import { DoubleSide, Mesh, MeshBasicMaterial, Texture, Vector3 } from 'three';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import ViewOptionsContext from '@/contexts/ViewOptionsContext';
import { useTheme } from '@mui/material';

type Point3D = [x: number, y: number, z: number];

export default function RenderedPolygon({
  vertexGroupMode,
  vertexes,
  address,
  objectKey,
  selectedObjectKey,
  onSelectObjectKey,
  texture
}: NLPolygon & {
  objectKey: string;
  selectedObjectKey?: string;
  onSelectObjectKey: (key: string) => void;
  texture?: Texture;
}) {
  const { meshDisplayMode, showPolygonAddresses } =
    useContext(ViewOptionsContext);
  const textRef = useRef();
  const theme = useTheme();

  const { sceneMesh: colors } = theme.palette;
  let color: React.CSSProperties['color'];

  const isSelected = objectKey === selectedObjectKey;

  if (meshDisplayMode === 'wireframe') {
    color = isSelected ? colors.selected : colors.default;
  } else {
    color = isSelected ? colors.textureSelected : undefined;
  }

  useFrame(({ camera }) => {
    if (textRef.current) {
      const cameraPosition = new Vector3();
      camera.getWorldPosition(cameraPosition);

      const mesh = textRef.current as Mesh;
      mesh?.lookAt(cameraPosition);
    }
  });

  const [vertices, normals, uvs, indices, displayPosition] = useMemo(() => {
    let vArrayIndex = 0;
    let nArrayIndex = 0;
    let uvArrayIndex = 0;

    const vArray = new Float32Array(vertexes.length * 3);
    const nArray = new Float32Array(vertexes.length * 3);
    const iArray: number[] = [];
    const uvArray = new Float32Array(vertexes.length * 2);

    // display position is an aggregated weight
    // @TODO: precalculate
    let dArray: Point3D = [0, 0, 0];

    vertexes.forEach((v, i) => {
      v.position.forEach((v, i) => {
        vArray[vArrayIndex++] = v;
        dArray[i] += v;
      });

      nArray[nArrayIndex++] = v.normals[0];
      nArray[nArrayIndex++] = v.normals[1];
      nArray[nArrayIndex++] = v.normals[2];

      uvArray[uvArrayIndex++] = v.uv[0];
      uvArray[uvArrayIndex++] = v.uv[1];
      iArray.push(i);

      if (vertexGroupMode === 'regular') {
        if (i + 1 < vertexes.length) {
          iArray.push(i + 1);
        }
        if (i + 2 < vertexes.length) {
          iArray.push(i + 2);
        }
      }
    });

    dArray = dArray.map((c) => Math.round(c / vertexes.length)) as Point3D;

    return [vArray, nArray, uvArray, new Uint16Array(iArray), dArray];
  }, [vertexes, vertexGroupMode]);

  const meshModeMaterialProps =
    meshDisplayMode === 'wireframe'
      ? {
          wireframe: true,
          wireframeLinewidth: isSelected ? 4 : 3
        }
      : {
          map: texture,
          side: DoubleSide,
          transparent: true,
          opacity: isSelected ? 0.75 : 1
        };

  const meshAddressText = useMemo(() => {
    const material = new MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.75
    });

    return !isSelected ||
      meshDisplayMode === 'textured' ||
      !showPolygonAddresses ? undefined : (
      <Text
        font={'/fonts/robotoLightRegular.json'}
        fontSize={16}
        position={displayPosition}
        ref={textRef}
        material={material}
      >
        [{objectKey}] {`0x${address.toString(16)}`}
      </Text>
    );
  }, [color, showPolygonAddresses, meshDisplayMode, isSelected]);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.nativeEvent.stopPropagation();
    e.stopPropagation();
    onSelectObjectKey(objectKey);
  };

  return (
    <>
      {meshAddressText}
      <mesh
        key={`${address}_${meshDisplayMode}_${color}`}
        onClick={handleClick}
      >
        <meshBasicMaterial color={color} {...meshModeMaterialProps} />
        <bufferGeometry attach={'geometry'}>
          <bufferAttribute
            attach='attributes-position'
            count={vertices.length / 3}
            array={vertices}
            itemSize={3}
          />
          <bufferAttribute
            attach='attributes-uv'
            count={uvs.length / 2}
            array={uvs}
            itemSize={2}
          />
          <bufferAttribute
            attach='attributes-normal'
            count={normals.length / 3}
            array={normals}
            itemSize={3}
          />
          <bufferAttribute
            array={indices}
            attach='index'
            count={indices.length}
            itemSize={1}
          />
        </bufferGeometry>
      </mesh>
    </>
  );
}
