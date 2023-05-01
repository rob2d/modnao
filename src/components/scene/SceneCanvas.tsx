import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { selectModel } from '@/store/selectors';
import { useSignal, useSignalEffect } from '@preact/signals-react';
import { useAsyncDispatchOnMount } from '@/hooks';
import { useAppSelector, setObjectIndex, loadStage } from '@/store';
import RenderedMesh from './RenderedMesh';

export default function SceneCanvas() {
  const dispatch = useAsyncDispatchOnMount(loadStage());

  const model = useAppSelector(selectModel);
  const selectedIndex = useSignal(-1);

  useSignalEffect(() => {
    dispatch(setObjectIndex(selectedIndex.value));
  });

  return (
    <Canvas frameloop='demand' camera={{ far: 100000 }}>
      <axesHelper args={[1000]} />
      {(model?.meshes || []).map((m, i) => (
        <RenderedMesh key={i} index={i} {...m} selectedIndex={selectedIndex} />
      ))}
      <OrbitControls />
    </Canvas>
  );
}
