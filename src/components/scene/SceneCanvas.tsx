import { useCallback, useContext } from 'react';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import {
  selectMeshDisplayMode,
  selectModel,
  selectObjectIndex
} from '@/store/selectors';
import { useAppSelector, useAppDispatch, setObjectIndex } from '@/store';
import RenderedMesh from './RenderedMesh';
import { useTemporaryModelNav } from '@/hooks';
import ViewOptionsContext from '@/contexts/ViewOptionsContext';

THREE.ColorManagement.enabled = true;

const cameraParams = { far: 500000 };

export default function SceneCanvas() {
  const viewOptions = useContext(ViewOptionsContext);
  useTemporaryModelNav();

  const dispatch = useAppDispatch();
  const objectIndex = useAppSelector(selectObjectIndex);
  const meshDisplayMode = useAppSelector(selectMeshDisplayMode);
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

  return (
    <Canvas camera={cameraParams} frameloop='demand'>
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
            meshDisplayMode={meshDisplayMode}
          />
        ))}
        <OrbitControls />
      </group>
    </Canvas>
  );
}
