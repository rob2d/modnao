import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { Canvas } from '@react-three/fiber';
import {
  selectAllDisplayedMeshes,
  selectDisplayedMeshes,
  selectMeshSelectionType,
  selectModel,
  selectObjectKey,
  selectResourceAttribs,
  selectUpdatedTextureDefs
} from '@/selectors';
import { setObjectKey } from '@/modules/object-viewer';
import { useAppDispatch, useAppSelector } from '@/storeTypings';
import { useObjectNavControls } from '@/modules/object-viewer';
import SceneOptionsContext from '@/contexts/SceneOptionsContext';
import { Box, Typography, useTheme } from '@mui/material';
import { SceneContextSetup } from '@/contexts/SceneContext';
import {
  EffectComposer,
  Outline,
  Selection
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import {
  ClampToEdgeWrapping,
  ColorManagement,
  DataTexture,
  RepeatWrapping,
  RGBAFormat,
  SRGBColorSpace,
  Texture,
  UnsignedByteType,
  Vector2,
  WebGLRenderer
} from 'three';
import RenderedPolygon from './scene/RenderedPolygon';
import SceneCameraControls from './scene/SceneCameraControls';
import globalBuffers from '@/utils/data/globalBuffers';
import ModelResourceAttribs from '@/modules/object-viewer/components/ModelResourceAttribs';

ColorManagement.enabled = true;

const cameraParams = { near: 0.1, far: 5000000 };
const canvasResizeParams = { debounce: 125 };

const TEXTURE_ROTATION = 1.5708;
const TEXTURE_CENTER = new Vector2(0.5, 0.5);

const useClientEffect =
  typeof window !== 'undefined' ? useEffect : () => undefined;

const axesHelper = <axesHelper args={[50]} />;

const textureTypes = ['opaque', 'translucent'] as const;

export default function SceneView() {
  useObjectNavControls();

  const [textureMap, setTextureMap] =
    useState<Map<string, { texture: DataTexture; bufferKey: string }>>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneOptions = useContext(SceneOptionsContext);
  const resourceAttribs = useAppSelector(selectResourceAttribs);

  const dispatch = useAppDispatch();
  const objectKey = useAppSelector(selectObjectKey);
  const meshSelectionType = useAppSelector(selectMeshSelectionType);
  const onSelectObjectKey = useCallback(
    (key: string | undefined) => {
      dispatch(setObjectKey(objectKey !== key ? key : undefined));
    },
    [objectKey]
  );

  const textureDefs = useAppSelector(selectUpdatedTextureDefs);
  const model = useAppSelector(selectModel);
  const theme = useTheme();

  const canvasStyle = useMemo(
    () => ({
      position: 'absolute' as const,
      top: '0',
      left: '0',
      touchAction: 'none',
      background: theme.palette.scene.background,
      cursor: sceneOptions.sceneCursorVisible ? 'default' : 'none'
    }),
    [sceneOptions.sceneCursorVisible, theme.palette.scene.background]
  );

  useClientEffect(() => {
    const nextMap = new Map<
      string,
      { texture: DataTexture; bufferKey: string }
    >();

    for (const textureDef of textureDefs) {
      textureTypes.forEach((type: 'opaque' | 'translucent') => {
        const bufferKey = textureDef.bufferKeys[type];
        if (!bufferKey) {
          return;
        }

        [true, false].forEach((hRepeat) =>
          [true, false].forEach((vRepeat) => {
            const mapKey = `${bufferKey}-${Number(hRepeat)}-${Number(vRepeat)}`;

            if (!textureMap?.has(mapKey)) {
              const pixels = globalBuffers.get(bufferKey);
              const texture = new DataTexture(
                pixels,
                textureDef.width,
                textureDef.height,
                RGBAFormat,
                UnsignedByteType,
                Texture.DEFAULT_MAPPING,
                hRepeat ? RepeatWrapping : ClampToEdgeWrapping,
                vRepeat ? RepeatWrapping : ClampToEdgeWrapping,
                undefined,
                undefined,
                undefined,
                SRGBColorSpace
              );
              texture.rotation = TEXTURE_ROTATION;
              texture.center = TEXTURE_CENTER;
              texture.repeat.y = -1;
              texture.flipY = false;
              texture.needsUpdate = true;
              nextMap.set(mapKey, { texture, bufferKey });
            } else {
              nextMap.set(
                mapKey,
                textureMap.get(mapKey) as {
                  texture: DataTexture;
                  bufferKey: string;
                }
              );
            }
          })
        );
      });
    }

    setTextureMap(nextMap);
  }, [textureDefs]);

  const selectedMeshes = useAppSelector(selectDisplayedMeshes);
  const meshes = useAppSelector(selectAllDisplayedMeshes);
  const axesHelperVisible =
    sceneOptions.axesHelperVisible && !sceneOptions.enableCinematicMode;

  const renderedModels = useMemo(
    () =>
      (sceneOptions.renderAllModels ? meshes : [selectedMeshes]).map(
        (ms, msi) => (
          <mesh
            key={`meshGroup_${msi}_${sceneOptions.renderAllModels ? 1 : 0}`}
            position={
              !sceneOptions.renderAllModels
                ? [0, 0, 0]
                : [msi * 500, msi * 50, 0]
            }
          >
            {ms.map((m, i) => {
              const texture = textureMap?.get(m.textureHash)?.texture || null;
              return m.polygons.map((p, pIndex) => (
                <RenderedPolygon
                  {...p}
                  key={`${m.address}_${p.address}`}
                  objectKey={
                    meshSelectionType === 'mesh' ? `${i}` : `${i}_${pIndex}`
                  }
                  selectedObjectKey={objectKey}
                  onSelectObjectKey={onSelectObjectKey}
                  texture={texture}
                />
              ));
            })}
          </mesh>
        )
      ),
    [
      model,
      !sceneOptions.renderAllModels ? selectedMeshes : meshes,
      textureMap,
      objectKey,
      meshSelectionType,
      onSelectObjectKey
    ]
  );

  const onSceneCreated = useCallback(({ gl }: { gl: WebGLRenderer }) => {
    gl.outputColorSpace = SRGBColorSpace;
  }, []);

  return (
    <>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          pointerEvents: 'none'
        }}
      >
        <ModelResourceAttribs />
      </Box>
      <Canvas
        resize={canvasResizeParams}
        camera={cameraParams}
        frameloop='demand'
        style={canvasStyle}
        ref={canvasRef}
        onCreated={onSceneCreated}
      >
        <Selection
          enabled={
            sceneOptions.meshDisplayMode === 'textured' &&
            Boolean(objectKey) &&
            !sceneOptions.renderAllModels
          }
        >
          <SceneContextSetup />
          <EffectComposer autoClear={false} key={objectKey}>
            <Outline
              edgeStrength={30}
              pulseSpeed={1}
              blendFunction={BlendFunction.SCREEN}
              visibleEdgeColor={
                theme.palette.scene.selected as unknown as number
              }
              hiddenEdgeColor={
                theme.palette.scene.selected as unknown as number
              }
            />
          </EffectComposer>
          <group>
            {!axesHelperVisible ? undefined : axesHelper}
            {renderedModels}
          </group>
          <SceneCameraControls mainBounds={model?.mainBounds} />
        </Selection>
      </Canvas>
    </>
  );
}
