import {
  MutableRefObject,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import {
  selectAllDisplayedMeshes,
  selectDisplayedMeshes,
  selectMeshSelectionType,
  selectModel,
  selectObjectKey,
  selectUneditedTextureUrls,
  selectUpdatedTextureDefs,
  setObjectKey,
  useAppDispatch,
  useAppSelector
} from '@/store';
import { useObjectNavControls } from '@/hooks';
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
  ColorManagement,
  DataTexture,
  RepeatWrapping,
  RGBAFormat,
  SRGBColorSpace,
  Texture,
  UnsignedByteType,
  Vector2
} from 'three';
import { objectUrlToBuffer } from '@/utils/data';
import RenderedPolygon from './scene/RenderedPolygon';

ColorManagement.enabled = true;

const cameraParams = { far: 5000000 };
const canvasResizeParams = { debounce: 300 };

const TEXTURE_ROTATION = 1.5708;
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
    UnsignedByteType,
    Texture.DEFAULT_MAPPING,
    undefined,
    undefined,
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

  return texture;
}

const axesHelper = <axesHelper args={[50]} />;

export default function SceneView() {
  useObjectNavControls();
  const [textureMap, setTextureMap] = useState<Map<string, DataTexture>>();
  const canvasRef = useRef() as MutableRefObject<HTMLCanvasElement>;
  const viewOptions = useContext(ViewOptionsContext);

  const dispatch = useAppDispatch();
  const objectKey = useAppSelector(selectObjectKey);
  const meshSelectionType = useAppSelector(selectMeshSelectionType);
  const onSelectObjectKey = useCallback(
    (key: string) => {
      dispatch(setObjectKey(objectKey !== key ? key : undefined));
    },
    [objectKey]
  );

  const uneditedTextureUrls = useAppSelector(selectUneditedTextureUrls);
  const textureDefs = useAppSelector(selectUpdatedTextureDefs);
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

  const selectedMeshes = useAppSelector(selectDisplayedMeshes);
  const meshes = useAppSelector(selectAllDisplayedMeshes);

  const renderedModels = useMemo(
    () =>
      (viewOptions.renderAllModels ? meshes : [selectedMeshes]).map(
        (ms, msi) => (
          <mesh
            key={`meshGroup_${msi}_${viewOptions.renderAllModels ? 1 : 0}`}
            position={
              !viewOptions.renderAllModels
                ? [0, 0, 0]
                : [msi * 500, msi * 50, 0]
            }
          >
            {ms.map((m, i) => {
              const texture = textureMap?.get(m.textureHash) || null;

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
      !viewOptions.renderAllModels ? selectedMeshes : meshes,
      textureMap,
      objectKey,
      meshSelectionType,
      onSelectObjectKey
    ]
  );

  return (
    <Canvas
      resize={canvasResizeParams}
      camera={cameraParams}
      frameloop='demand'
      style={canvasStyle}
      ref={canvasRef}
    >
      <Selection
        enabled={
          viewOptions.meshDisplayMode === 'textured' &&
          Boolean(objectKey) &&
          !viewOptions.renderAllModels
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
        <group>
          {!viewOptions.axesHelperVisible ? undefined : axesHelper}
          {renderedModels}
          <OrbitControls />
        </group>
      </Selection>
    </Canvas>
  );
}
