import { useCallback, useContext, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
import { Canvas, ThreeEvent } from '@react-three/fiber';
import {
  selectModel,
  selectObjectKey,
  selectObjectSelectionType
} from '@/store/selectors';
import { useAppSelector, useAppDispatch, setObjectKey } from '@/store';
import RenderedMesh from './RenderedMesh';
import { useSceneKeyboardActions } from '@/hooks';
import ViewOptionsContext from '@/contexts/ViewOptionsContext';
import { styled, useTheme } from '@mui/material';
import { SceneContextSetup } from '@/contexts/SceneContext';

THREE.ColorManagement.enabled = true;

const cameraParams = { far: 5000000 };

const Styled = styled('div')(
  () => `
  & {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    zIndex: -1;
  }
`
);

export default function SceneCanvas() {
  useSceneKeyboardActions();

  const viewOptions = useContext(ViewOptionsContext);

  const dispatch = useAppDispatch();
  const objectKey = useAppSelector(selectObjectKey);
  const objectSelectionType = useAppSelector(selectObjectSelectionType);
  const onSelectObjectKey = useCallback(
    (key: string) => {
      dispatch(setObjectKey(objectKey !== key ? key : undefined));
    },
    [objectKey]
  );

  const textureDefs = useAppSelector((s) => s.stageData.textureDefs);
  const model = useAppSelector(selectModel);
  const theme = useTheme();

  const canvasStyle = useMemo(
    () => ({
      background: theme.palette.scene.background,
      cursor: viewOptions.sceneCursorVisible ? 'default' : 'none'
    }),
    [viewOptions.sceneCursorVisible, theme]
  );

  return (
    <Styled>
      <Canvas camera={cameraParams} frameloop='demand' style={canvasStyle}>
        <SceneContextSetup />
        <group dispose={null}>
          {!viewOptions.axesHelperVisible ? undefined : (
            <axesHelper args={[50]} />
          )}
          {(model?.meshes || []).map((m, i) => (
            <RenderedMesh
              key={m.address}
              {...m}
              objectKey={`${i}`}
              selectedObjectKey={objectKey}
              objectSelectionType={objectSelectionType}
              onSelectObjectKey={onSelectObjectKey}
              textureDefs={textureDefs}
            />
          ))}
          <OrbitControls />
        </group>
      </Canvas>
    </Styled>
  );
}
