import { Canvas } from '@react-three/fiber';
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NLMesh, loadStage } from '@/store/stageDataSlice';
import { AppThunkDispatch } from '@/store/store';
import { selectModel } from '@/store/selectors';
import RenderedMesh from './RenderedMesh';

export default function SceneCanvas() {
  const dispatch = useDispatch<AppThunkDispatch>();
  useEffect(() => {
    const promise = dispatch(loadStage());
    return () => promise.abort();
  }, [dispatch]);

  /**
   * TODO: selection highlighting behavior
   */
  const onClick = useCallback(() => false, []);

  const model = useSelector(selectModel);

  return (
    <Canvas>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      {(model?.meshes || []).map((m: NLMesh, i) => (
        <RenderedMesh key={i} {...m} isSelected={false} onClick={onClick} />
      ))}
    </Canvas>
  );
}
