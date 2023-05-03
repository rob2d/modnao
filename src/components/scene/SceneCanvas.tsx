import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { selectModel } from '@/store/selectors';
import { useSignal, useSignalEffect } from '@preact/signals-react';
import { useAppSelector, setObjectIndex, useAppDispatch } from '@/store';
import RenderedMesh from './RenderedMesh';

THREE.ColorManagement.enabled = true;

export default function SceneCanvas() {
  const dispatch = useAppDispatch();
  const model = useAppSelector(selectModel);
  const selectedIndex = useSignal(-1);

  useSignalEffect(() => {
    dispatch(setObjectIndex(selectedIndex.value));
  });

  return (
    <Canvas frameloop='demand' camera={{ far: 100000 }}>
      <axesHelper args={[50]} />
      {(model?.meshes || []).map((m, i) => (
        <RenderedMesh
          key={`${i}-${selectedIndex.value}`}
          index={i}
          {...m}
          selectedIndex={selectedIndex}
        />
      ))}
      <OrbitControls />
    </Canvas>
  );
}
