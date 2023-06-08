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
  selectObjectSelectionType
} from '@/store/selectors';
import { useAppSelector, useAppDispatch, setObjectKey } from '@/store';
import RenderedMesh from './RenderedMesh';
import { useSceneKeyboardActions } from '@/hooks';
import ViewOptionsContext from '@/contexts/ViewOptionsContext';
import { styled, useTheme } from '@mui/material';
import { SceneContextSetup } from '@/contexts/SceneContext';

THREE.ColorManagement.enabled = true;

const cameraParams = { far: 5000000 };

const Styled = styled('div')(
  () => `
  & {
    position: relative;
    flex-grow: 1;
    height: 100%;
    display: flex;
    zIndex: -1;
  }
`
);

export default function SceneCanvas() {
  useSceneKeyboardActions();
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

  const textureDefs = useAppSelector((s) => s.modelData.textureDefs);
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
    const resizeObserver = new ResizeObserver((entries) => {
      // Get the new size of the container element
      const { width, height } = entries[0].contentRect;

      // Update the size of the canvas
      const canvas = canvasRef.current?.childNodes[0] as HTMLCanvasElement;
      if (canvas) {
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }
    });

    const containerElement = canvasRef.current;
    resizeObserver.observe(containerElement);

    return () => {
      resizeObserver.unobserve(containerElement);
    };
  }, []);

  return (
    <Styled>
      <Canvas
        camera={cameraParams}
        frameloop='demand'
        style={canvasStyle}
        ref={canvasRef}
      >
        <SceneContextSetup />
        <group dispose={null}>
          {!viewOptions.axesHelperVisible ? undefined : (
            <axesHelper args={[50]} />
          )}
          {(model?.meshes || []).map((m, i) => (
            <RenderedMesh
              key={m.address}
              {...m}
              objectKey={`${i}`}
              selectedObjectKey={objectKey}
              objectSelectionType={objectSelectionType}
              onSelectObjectKey={onSelectObjectKey}
              textureDefs={textureDefs}
            />
          ))}
          <OrbitControls />
        </group>
      </Canvas>
    </Styled>
  );
}
