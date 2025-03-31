import React, { useCallback, useContext, useMemo, useRef } from 'react';
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
  flags,
  vertexGroupMode,
  vertices,
  indices,
  triIndices,
  address,
  objectKey,
  selectedObjectKey,
  onSelectObjectKey,
  texture
}: NLPolygon & {
  objectKey: string;
  selectedObjectKey?: string;
  onSelectObjectKey: (key: string) => void;
  texture: Texture | null;
}) {
  const viewOptions = useContext(ViewOptionsContext);
  const {
    meshDisplayMode,
    objectAddressesVisible,
    wireframeLineWidth,
    disableBackfaceCulling
  } = viewOptions;
  const textRef = useRef<Mesh>(null);
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

      const mesh = textRef.current;
      mesh?.lookAt(cameraPosition);
    }
  });

  const [vertexPositions, normals, uvs, indicesRendered, colorsRendered] =
    useMemo(() => {
      let vArrayIndex = 0;
      let nArrayIndex = 0;
      let uvArrayIndex = 0;
      let cArrayIndex = 0;

      const vPositions = new Float32Array(vertices.length * 3);
      const nArray = new Float32Array(vertices.length * 3);
      const uvArray = new Float32Array(vertices.length * 2);
      const cArray = new Float32Array(vertices.length * 4);
      const iArray = new Uint16Array(indices);

      vertices.forEach((v) => {
        v.position.forEach((p) => {
          vPositions[vArrayIndex++] = p;
        });

        if (v.colors?.length) {
          cArray[cArrayIndex++] = v.colors?.[0] ?? 1;
          cArray[cArrayIndex++] = v.colors?.[1] ?? 1;
          cArray[cArrayIndex++] = v.colors?.[2] ?? 1;
          cArray[cArrayIndex++] = v.colors?.[3] ?? 1;
        } else {
          cArray[cArrayIndex++] = 1;
          cArray[cArrayIndex++] = 1;
          cArray[cArrayIndex++] = 1;
          cArray[cArrayIndex++] = 1;
        }

        nArray[nArrayIndex++] = v.normals[0];
        nArray[nArrayIndex++] = v.normals[1];
        nArray[nArrayIndex++] = v.normals[2];

        uvArray[uvArrayIndex++] = v.uv[0];
        uvArray[uvArrayIndex++] = v.uv[1];
      });
      return [vPositions, nArray, uvArray, iArray, cArray];
    }, [vertices, vertexGroupMode, indices]);

  const meshAddressText = useMemo(() => {
    if (
      !isSelected ||
      meshDisplayMode === 'textured' ||
      !objectAddressesVisible
    ) {
      return undefined;
    }

    // display position is an aggregated weight
    let displayPosition: Point3D = [0, 0, 0];

    vertices.forEach((v) => {
      v.position.forEach((p, i) => (displayPosition[i] += p));
    });

    displayPosition = displayPosition.map((c) =>
      Math.round(c / vertices.length)
    ) as Point3D;

    return (
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
      opacity: 1,
      alphaTest: 0.0001,
      side: disableBackfaceCulling || !flags.culling ? DoubleSide : FrontSide
    }),
    [texture, disableBackfaceCulling || !flags.culling]
  );

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.nativeEvent.stopPropagation();
      e.stopPropagation();
      onSelectObjectKey(objectKey);
    },
    [onSelectObjectKey, objectKey]
  );

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
              colors={colorsRendered}
              materialProps={texturedMaterialProps}
              viewOptions={viewOptions}
            />
          ) : (
            <RenderedWireframePolygon
              color={color}
              vertices={vertices}
              triIndices={triIndices}
              lineWidth={wireframeLineWidth}
            />
          )}
        </mesh>
      </Select>
    </>
  );
}
