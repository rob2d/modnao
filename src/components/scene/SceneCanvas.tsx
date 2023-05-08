import { useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { selectModel, selectObjectIndex } from '@/store/selectors';
import { useAppSelector, useAppDispatch, setObjectIndex } from '@/store';
import RenderedMesh from './RenderedMesh';
import { useTemporaryModelNav } from '@/hooks';

THREE.ColorManagement.enabled = true;

const cameraParams = { far: 500000 };

export default function SceneCanvas() {
  useTemporaryModelNav();
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

  const model = useAppSelector(selectModel);

  return (
    <Canvas camera={cameraParams} frameloop='demand'>
      <group dispose={null}>
        <axesHelper args={[50]} />
        {(model?.meshes || []).map((m, i) => (
          <RenderedMesh
            key={m.address}
            index={i}
            {...m}
            objectIndex={objectIndex}
            onSelectObjectIndex={onSelectObjectIndex}
          />
        ))}
        <OrbitControls />
      </group>
    </Canvas>
  );
}
