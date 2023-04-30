import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useCallback } from 'react';
import { NLMesh, loadStage } from '@/store/stageDataSlice';
import { selectModel } from '@/store/selectors';
import RenderedMesh from './RenderedMesh';
import useAsyncDispatchOnMount from '@/hooks/useAsyncDispatchOnMount';
import { useAppSelector } from '@/store/store';

export default function SceneCanvas() {
  useAsyncDispatchOnMount(loadStage());
  const model = useAppSelector(selectModel);

  // @TODO: selection highlighting behavior
  const onClick = useCallback(() => false, []);

  return (
    <Canvas frameloop='demand' camera={{ far: 100000 }}>
      <axesHelper args={[10]} />
      {(model?.meshes || []).map((m: NLMesh, i) => (
        <RenderedMesh key={i} {...m} isSelected={false} onClick={onClick} />
      ))}
      <OrbitControls />
    </Canvas>
  );
}
