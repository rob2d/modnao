import {
  MutableRefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef
} from 'react';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import {
  selectModel,
  selectObjectKey,
  selectObjectSelectionType,
  selectSceneTextureDefs
} from '@/store/selectors';
import { setObjectKey, useAppDispatch, useAppSelector } from '@/store';
import RenderedMesh from './RenderedMesh';
import { useSceneKeyboardControls } from '@/hooks';
import ViewOptionsContext from '@/contexts/ViewOptionsContext';
import { useTheme } from '@mui/material';
import { SceneContextSetup } from '@/contexts/SceneContext';
import {
  EffectComposer,
  Outline,
  Selection
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import {
  ClampToEdgeWrapping,
  DataTexture,
  RepeatWrapping,
  RGBAFormat,
  sRGBEncoding,
  UnsignedByteType,
  Vector2
} from 'three';
import { objectUrlToBuffer } from '@/utils/data';

THREE.ColorManagement.enabled = true;

const cameraParams = { far: 5000000 };

const textureMap = new Map<string, DataTexture>();

const TEXTURE_ROTATION = (90 * Math.PI) / 180;
const TEXTURE_CENTER = new Vector2(0.5, 0.5);

async function createTextureFromObjectUrl(
  pixelObjectUrl: string,
  width: number,
  height: number
) {
  const pixels = Buffer.from(await objectUrlToBuffer(pixelObjectUrl));
  const texture = new DataTexture(
    pixels,
    width,
    height,
    RGBAFormat,
    UnsignedByteType
  );
  texture.needsUpdate = true;

  return texture;
}

export default function SceneCanvas() {
  useSceneKeyboardControls();
  const canvasRef = useRef() as MutableRefObject<HTMLCanvasElement>;
  const viewOptions = useContext(ViewOptionsContext);

  const dispatch = useAppDispatch();
  const objectKey = useAppSelector(selectObjectKey);
  const objectSelectionType = useAppSelector(selectObjectSelectionType);
  const onSelectObjectKey = useCallback(
    (key: string) => {
      dispatch(setObjectKey(objectKey !== key ? key : undefined));
    },
    [objectKey]
  );

  const textureDefs = useAppSelector(selectSceneTextureDefs);
  const model = useAppSelector(selectModel);
  const theme = useTheme();

  const canvasStyle = useMemo(
    () => ({
      position: 'absolute' as const,
      top: '0',
      left: '0',
      background: theme.palette.scene.background,
      cursor: viewOptions.sceneCursorVisible ? 'default' : 'none'
    }),
    [viewOptions.sceneCursorVisible, theme]
  );

  useEffect(() => {
    (async () => {
      for await (const t of textureDefs) {
        for await (const type of ['opaque', 'translucent']) {
          const url = t.bufferUrls[type as 'opaque' | 'translucent'];
          if (!url) {
            continue;
          }
          for await (const hRepeat of [true, false]) {
            for await (const vRepeat of [true, false]) {
              const key = `${url}-${hRepeat ? 1 : 0}-${vRepeat ? 1 : 0}`;
              if (!textureMap.has(key)) {
                const texture = await createTextureFromObjectUrl(
                  url,
                  t.width,
                  t.height
                );

                texture.rotation = TEXTURE_ROTATION;
                texture.center = TEXTURE_CENTER;

                // addresses an issue in ThreeJS with
                // sRGB randomly not applying to textures depending
                // on how it is created
                texture.encoding = sRGBEncoding;
                texture.repeat.y = -1;
                texture.wrapS = hRepeat ? RepeatWrapping : ClampToEdgeWrapping;
                texture.wrapT = vRepeat ? RepeatWrapping : ClampToEdgeWrapping;

                textureMap.set(key, texture);
              }
            }
          }
        }
      }
    })();
  }, [textureDefs]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;

      const canvas = canvasRef.current?.childNodes[0] as HTMLCanvasElement;
      if (canvas) {
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }
    });

    const containerElement = canvasRef.current;
    resizeObserver.observe(containerElement);

    return () => resizeObserver.unobserve(containerElement);
  }, []);

  return (
    <Canvas
      camera={cameraParams}
      frameloop='demand'
      style={canvasStyle}
      ref={canvasRef}
    >
      <Selection
        enabled={
          viewOptions.meshDisplayMode === 'textured' && Boolean(objectKey)
        }
      >
        <EffectComposer autoClear={false} key={objectKey}>
          <Outline
            edgeStrength={30}
            pulseSpeed={1}
            blendFunction={BlendFunction.SCREEN}
            visibleEdgeColor={theme.palette.scene.selected as unknown as number}
            hiddenEdgeColor={theme.palette.scene.selected as unknown as number}
          />
        </EffectComposer>
        <SceneContextSetup />
        <group dispose={null}>
          {!viewOptions.axesHelperVisible ? undefined : (
            <axesHelper args={[50]} />
          )}
          {(model?.meshes || []).map((m, i) => {
            const tDef = textureDefs[m.textureIndex];
            if (!tDef) {
              return undefined;
            }
            const url = tDef.bufferUrls[m.isOpaque ? 'opaque' : 'translucent'];
            const { hRepeat, vRepeat } = m.textureWrappingFlags;
            const textureHash = `${url}-${hRepeat ? 1 : 0}-${vRepeat ? 1 : 0}`;
            const texture = textureMap.get(textureHash) || null;
            if (texture) {
              texture.needsUpdate = true;
            }

            return (
              <RenderedMesh
                key={m.address}
                {...m}
                objectKey={`${i}`}
                selectedObjectKey={objectKey}
                objectSelectionType={objectSelectionType}
                onSelectObjectKey={onSelectObjectKey}
                texture={texture}
              />
            );
          })}
          <OrbitControls />
        </group>
      </Selection>
    </Canvas>
  );
}
