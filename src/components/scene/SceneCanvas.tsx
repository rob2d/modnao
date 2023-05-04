import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import selectedSceneIndex from './selectedSceneIndex.signal';
import { selectModel, selectModelViewedIndex } from '@/store/selectors';
import { useSignalEffect } from '@preact/signals-react';
import { useAppSelector, setObjectIndex, useAppDispatch } from '@/store';
import RenderedMesh from './RenderedMesh';
import useThemeMode from '@/theming/useThemeMode';

THREE.ColorManagement.enabled = true;

export default function SceneCanvas() {
  // TODO: discard signals for effects since canvas loses
  // context when theming causes dom to refresh and creates
  // interesting issues

  const themeMode = useThemeMode();
  const dispatch = useAppDispatch();
  const selectedStoreIndex = useAppSelector(selectModelViewedIndex);

  const model = useAppSelector(selectModel);

  useSignalEffect(() => {
    if (selectedSceneIndex.value !== selectedStoreIndex) {
      dispatch(setObjectIndex(selectedSceneIndex.value));
    }
  });

  return (
    <Canvas frameloop='demand' camera={{ far: 100000 }} key={0}>
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
