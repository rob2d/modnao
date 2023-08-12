import React, { useContext, useMemo, useRef } from 'react';
import { Text } from '@react-three/drei';
import { DoubleSide, FrontSide, Mesh, Texture, Vector3 } from 'three';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import ViewOptionsContext from '@/contexts/ViewOptionsContext';
import { useTheme } from '@mui/material';
import RenderedTexturedPolygon from './RenderedTexturedPolygon';
import RenderedWireframePolygon from './RenderedWireframePolygon';
import { Select } from '@react-three/postprocessing';

type Point3D = [x: number, y: number, z: number];

export default function RenderedPolygon({
  vertexGroupMode,
  vertices,
  indices,
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
  texture: Texture | null;
}) {
  const {
    meshDisplayMode,
    objectAddressesVisible,
    wireframeLineWidth,
    disableBackfaceCulling
  } = useContext(ViewOptionsContext);
  const textRef = useRef();
  const theme = useTheme();

  const { scene: colors } = theme.palette;
  let color: React.CSSProperties['color'];

  const isSelected = objectKey === selectedObjectKey;

  if (meshDisplayMode === 'wireframe') {
    color = isSelected ? colors.selected : colors.default;
  }

  useFrame(({ camera }) => {
    if (textRef.current) {
      const cameraPosition = new Vector3();
      camera.getWorldPosition(cameraPosition);

      const mesh = textRef.current as Mesh;
      mesh?.lookAt(cameraPosition);
    }
  });

  const [vertexPositions, normals, uvs, indicesRendered, displayPosition] =
    useMemo(() => {
      let vArrayIndex = 0;
      let nArrayIndex = 0;
      let uvArrayIndex = 0;

      const vPositions = new Float32Array(vertices.length * 3);
      const nArray = new Float32Array(vertices.length * 3);
      const uvArray = new Float32Array(vertices.length * 2);
      const iArray = new Uint16Array(indices);

      // display position is an aggregated weight
      // @TODO: precalculate
      let dArray: Point3D = [0, 0, 0];

      vertices.forEach((v) => {
        v.position.forEach((p, i) => {
          vPositions[vArrayIndex++] = p;
          dArray[i] += p;
        });

        nArray[nArrayIndex++] = v.normals[0];
        nArray[nArrayIndex++] = v.normals[1];
        nArray[nArrayIndex++] = v.normals[2];

        uvArray[uvArrayIndex++] = v.uv[0];
        uvArray[uvArrayIndex++] = v.uv[1];
      });

      dArray = dArray.map((c) => Math.round(c / vertices.length)) as Point3D;
      return [vPositions, nArray, uvArray, iArray, dArray];
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

  const texturedMaterialProps = useMemo(
    () => ({
      map: texture,
      transparent: true,
      opacity: isSelected ? 0.75 : 1,
      alphaTest: isSelected ? 0 : 1,
      side: disableBackfaceCulling ? DoubleSide : FrontSide
    }),
    [texture, isSelected, disableBackfaceCulling]
  );

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.nativeEvent.stopPropagation();
    e.stopPropagation();
    onSelectObjectKey(objectKey);
  };

  return (
    <>
      {meshAddressText}
      <Select enabled={isSelected}>
        <mesh
          key={`${address}_${meshDisplayMode}_${color}_${isSelected}_${
            Boolean(texture) ? 1 : 0
          }`}
          onClick={handleClick}
        >
          {meshDisplayMode === 'textured' ? (
            <RenderedTexturedPolygon
              vertexPositions={vertexPositions}
              normals={normals}
              uvs={uvs}
              indices={indicesRendered}
              materialProps={texturedMaterialProps}
            />
          ) : (
            <RenderedWireframePolygon
              color={color}
              vertices={vertices}
              indices={indicesRendered}
              lineWidth={wireframeLineWidth}
            />
          )}
        </mesh>
      </Select>
    </>
  );
}
