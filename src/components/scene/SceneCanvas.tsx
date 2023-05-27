import { useCallback, useContext, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { selectModel, selectObjectIndex } from '@/store/selectors';
import { useAppSelector, useAppDispatch, setObjectIndex } from '@/store';
import RenderedMesh from './RenderedMesh';
import { useSceneKeyboardActions } from '@/hooks';
import ViewOptionsContext from '@/contexts/ViewOptionsContext';
import { useTheme } from '@mui/material';
import { SceneContextSetup } from '@/contexts/SceneContext';

THREE.ColorManagement.enabled = true;

const cameraParams = { far: 5000000 };

export default function SceneCanvas() {
  useSceneKeyboardActions();

  const viewOptions = useContext(ViewOptionsContext);

  const dispatch = useAppDispatch();
  const objectIndex = useAppSelector(selectObjectIndex);
  const onSelectObjectIndex = useCallback(
    (i: number) => {
      if (objectIndex !== i) {
        dispatch(setObjectIndex(i));
      }
    },
    [objectIndex]
  );

  const textureDefs = useAppSelector((s) => s.stageData.textureDefs);
  const model = useAppSelector(selectModel);
  const theme = useTheme();

  const canvasStyle = useMemo(
    () => ({
      background: theme.palette.scene.background,
      cursor: viewOptions.showSceneCursor ? 'default' : 'none'
    }),
    [viewOptions.showSceneCursor, theme]
  );

  return (
    <Canvas camera={cameraParams} frameloop='demand' style={canvasStyle}>
      <SceneContextSetup />
      <group dispose={null}>
        {!viewOptions.showAxesHelper ? undefined : <axesHelper args={[50]} />}
        {(model?.meshes || []).map((m, i) => (
          <RenderedMesh
            key={m.address}
            index={i}
            {...m}
            objectIndex={objectIndex}
            onSelectObjectIndex={onSelectObjectIndex}
            textureDefs={textureDefs}
          />
        ))}
        <OrbitControls />
      </group>
    </Canvas>
  );
}
