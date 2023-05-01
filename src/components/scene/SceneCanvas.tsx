import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { NLMesh, loadStage } from '@/store/stageDataSlice';
import { selectModel } from '@/store/selectors';
import RenderedMesh from './RenderedMesh';
import useAsyncDispatchOnMount from '@/hooks/useAsyncDispatchOnMount';
import { useAppSelector } from '@/store/store';
import { useSignal } from '@preact/signals-react';

export default function SceneCanvas() {
  useAsyncDispatchOnMount(loadStage());
  const model = useAppSelector(selectModel);
  const selectedIndex = useSignal(-1);

  return (
    <Canvas frameloop='demand' camera={{ far: 100000 }}>
      <axesHelper args={[1000]} />
      {(model?.meshes || []).map((m: NLMesh, i) => (
        <RenderedMesh key={i} index={i} {...m} selectedIndex={selectedIndex} />
      ))}
      <OrbitControls />
    </Canvas>
  );
}
