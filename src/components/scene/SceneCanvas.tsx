import {
  MutableRefObject,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import {
  selectDisplayedMeshes,
  selectModel,
  selectObjectKey,
  selectObjectSelectionType,
  selectSceneTextureDefs,
  selectUneditedTextureUrls
} from '@/store/selectors';
import { setObjectKey, useAppDispatch, useAppSelector } from '@/store';
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
import RenderedPolygon from './RenderedPolygon';

THREE.ColorManagement.enabled = true;

const cameraParams = { far: 5000000 };

const TEXTURE_ROTATION = (90 * Math.PI) / 180;
const TEXTURE_CENTER = new Vector2(0.5, 0.5);

const useClientLayoutEffect =
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  typeof window !== 'undefined' ? useLayoutEffect : () => {};

async function createTextureFromObjectUrl(
  pixelObjectUrl: string,
  width: number,
  height: number
) {
  const pixels = new Uint8Array(await objectUrlToBuffer(pixelObjectUrl));
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

const axesHelper = <axesHelper args={[50]} />;

export default function SceneCanvas() {
  useSceneKeyboardControls();
  const [textureMap, setTextureMap] = useState<Map<string, DataTexture>>();
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

  const uneditedTextureUrls = useAppSelector(selectUneditedTextureUrls);
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

  useClientLayoutEffect(() => {
    const nextMap = new Map<string, DataTexture>();
    (async () => {
      for await (const t of textureDefs) {
        for await (const type of ['opaque', 'translucent']) {
          const url = t.bufferUrls[type as 'opaque' | 'translucent'];
          if (!url) {
            continue;
          }

          let baseTexture: DataTexture | undefined = undefined;

          for await (const hRepeat of [true, false]) {
            for await (const vRepeat of [true, false]) {
              const key = `${url}-${hRepeat ? 1 : 0}-${vRepeat ? 1 : 0}`;
              if (!textureMap?.has(key)) {
                if (baseTexture === undefined) {
                  baseTexture = await createTextureFromObjectUrl(
                    url,
                    t.width,
                    t.height
                  );

                  baseTexture.rotation = TEXTURE_ROTATION;
                  baseTexture.center = TEXTURE_CENTER;
                  baseTexture.repeat.y = -1;

                  // addresses an issue in ThreeJS with
                  // sRGB randomly not applying to textures depending
                  // on how it is created
                  baseTexture.encoding = sRGBEncoding;
                }

                const texture =
                  !hRepeat && !vRepeat ? baseTexture : baseTexture.clone();

                texture.wrapS = hRepeat ? RepeatWrapping : ClampToEdgeWrapping;
                texture.wrapT = vRepeat ? RepeatWrapping : ClampToEdgeWrapping;

                nextMap.set(key, texture);
              } else {
                nextMap.set(key, textureMap?.get(key) as DataTexture);
              }
            }
          }
        }
      }

      setTextureMap(nextMap);

      // revoke unused texture urls
      if (!textureMap) {
        return;
      }

      // free up memory for updated texture urls as needed
      for (const key of textureMap.keys()) {
        if (!nextMap.has(key) && !uneditedTextureUrls.has(key)) {
          URL.revokeObjectURL(key);
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

  const meshes = useAppSelector(selectDisplayedMeshes);

  const renderedMeshes = useMemo(
    () =>
      meshes.map((m, i) => {
        const tDef = textureDefs[m.textureIndex];
        if (!tDef) {
          return undefined;
        }
        const texture = textureMap?.get(m.textureHash) || null;

        return m.polygons.map((p, pIndex) => (
          <RenderedPolygon
            {...p}
            key={`${m.address}_${p.address}`}
            objectKey={
              objectSelectionType === 'mesh' ? `${i}` : `${i}_${pIndex}`
            }
            selectedObjectKey={objectKey}
            onSelectObjectKey={onSelectObjectKey}
            texture={texture}
          />
        ));
      }),
    [
      model,
      textureDefs,
      textureMap,
      objectKey,
      objectSelectionType,
      onSelectObjectKey
    ]
  );

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
          {!viewOptions.axesHelperVisible ? undefined : axesHelper}
          {renderedMeshes}
          <OrbitControls />
        </group>
      </Selection>
    </Canvas>
  );
}
