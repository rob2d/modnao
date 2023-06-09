import React, { useContext, useMemo, useRef } from 'react';
import { Text } from '@react-three/drei';
import { Mesh, Texture, Vector3 } from 'three';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import ViewOptionsContext from '@/contexts/ViewOptionsContext';
import { useTheme } from '@mui/material';
import RenderedTexturedPolygon from './RenderedTexturedPolygon';
import RenderedWireframePolygon from './RenderedWireframePolygon';

type Point3D = [x: number, y: number, z: number];

export default function RenderedPolygon({
  vertexGroupMode,
  vertices,
  address,
  objectKey,
  selectedObjectKey,
  onSelectObjectKey,
  texture,
  flags
}: NLPolygon & {
  objectKey: string;
  selectedObjectKey?: string;
  onSelectObjectKey: (key: string) => void;
  texture?: Texture;
}) {
  // @TODO: consider breaking down mesh material and components
  // to absorb context in subtrees if performance becomes an issue with
  // settings change scenario for user interactions
  // (seems not to be the case with workflows so far)

  const { meshDisplayMode, objectAddressesVisible, wireframeLineWidth } =
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

  const [vertexPositions, normals, uvs, indices, displayPosition] =
    useMemo(() => {
      let vArrayIndex = 0;
      let nArrayIndex = 0;
      let uvArrayIndex = 0;

      const vPositions = new Float32Array(vertices.length * 3);
      const nArray = new Float32Array(vertices.length * 3);
      const iArray: number[] = [];
      const uvArray = new Float32Array(vertices.length * 2);

      // display position is an aggregated weight
      // @TODO: precalculate
      let dArray: Point3D = [0, 0, 0];

      let stripCount = 0;

      vertices.forEach((v, i) => {
        v.position.forEach((v, i) => {
          vPositions[vArrayIndex++] = v;
          dArray[i] += v;
        });

        nArray[nArrayIndex++] = v.normals[0];
        nArray[nArrayIndex++] = v.normals[1];
        nArray[nArrayIndex++] = v.normals[2];

        uvArray[uvArrayIndex++] = v.uv[0];
        uvArray[uvArrayIndex++] = v.uv[1];

        if (vertexGroupMode === 'regular') {
          if (i > vertices.length - 3) {
            return;
          }

          if (stripCount % 2 === 0) {
            if (flags.cullingType === 'front') {
              iArray.push(i + 1, i, i + 2);
            } else {
              iArray.push(i, i + 1, i + 2);
            }
          } else {
            if (flags.cullingType === 'front') {
              iArray.push(i, i + 1, i + 2);
            } else {
              iArray.push(i + 1, i, i + 2);
            }
          }
        }

        stripCount += 1;
      });

      if (vertexGroupMode === 'triple') {
        for (let i = 2; i < vertices.length; i += 3) {
          if (flags.cullingType === 'front') {
            iArray.push(i - 1, i - 2, i);
          } else {
            iArray.push(i - 2, i - 1, i);
          }
        }
        stripCount += 1;
      }

      dArray = dArray.map((c) => Math.round(c / vertices.length)) as Point3D;

      return [vPositions, nArray, uvArray, new Uint16Array(iArray), dArray];
    }, [vertices, vertexGroupMode]);

  const meshAddressText = useMemo(() => {
    return !isSelected ||
      meshDisplayMode === 'textured' ||
      !objectAddressesVisible ? undefined : (
      <Text
        font={'/fonts/robotoLightRegular.json'}
        fontSize={16}
        position={displayPosition}
        ref={textRef}
      >
        [{objectKey}] {`0x${address.toString(16)}`}
      </Text>
    );
  }, [color, objectAddressesVisible, meshDisplayMode, isSelected]);

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
        {meshDisplayMode === 'textured' ? (
          <RenderedTexturedPolygon
            vertexPositions={vertexPositions}
            normals={normals}
            uvs={uvs}
            indices={indices}
            materialProps={{
              color,
              map: texture,
              transparent: true,
              opacity: isSelected ? 0.75 : 1
            }}
          />
        ) : (
          <RenderedWireframePolygon
            color={color}
            vertices={vertices}
            indices={indices}
            lineWidth={wireframeLineWidth}
          />
        )}
      </mesh>
    </>
  );
}
