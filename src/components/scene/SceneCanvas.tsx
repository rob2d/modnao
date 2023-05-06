import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import selectedSceneIndex from './selectedSceneIndex.signal';
import {
  selectModel,
  selectModelViewedIndex,
  selectObjectIndex
} from '@/store/selectors';
import { useSignalEffect } from '@preact/signals-react';
import { useAppSelector, setObjectIndex, useAppDispatch } from '@/store';
import RenderedMesh from './RenderedMesh';
import useThemeMode from '@/theming/useThemeMode';
import useTemporaryModelNav from '@/hooks/useTemporaryModelNav';

THREE.ColorManagement.enabled = true;

const cameraParams = { far: 100000 };

export default function SceneCanvas() {
  useTemporaryModelNav();

  // TODO: discard signals for effects since canvas loses
  // context when theming causes dom to refresh and creates
  // interesting issues with race conditions for signals
  // to complete

  const themeMode = useThemeMode();
  const dispatch = useAppDispatch();
  const selectedStoreIndex = useAppSelector(selectObjectIndex);

  const model = useAppSelector(selectModel);

  useSignalEffect(() => {
    if (selectedSceneIndex.value !== selectedStoreIndex) {
      dispatch(setObjectIndex(selectedSceneIndex.value));
    }
  });

  return (
    <Canvas frameloop='demand' camera={cameraParams}>
      <axesHelper args={[50]} />
      {(model?.meshes || []).map((m, i) => (
        <RenderedMesh
          key={`${i}-${selectedSceneIndex.value}-${themeMode}`}
          index={i}
          {...m}
          selectedSceneIndex={selectedSceneIndex}
        />
      ))}
      <OrbitControls />
    </Canvas>
  );
}
