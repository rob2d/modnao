import { useThree } from '@react-three/fiber';
import React, {
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { SRGBColorSpace, Scene } from 'three';

type SceneContextOptions = {
  scene: Scene | undefined;
  setScene: (scene?: Scene) => void;
};

export const SceneContext = React.createContext<SceneContextOptions>({
  scene: undefined,
  setScene: () => null
});

export function useSceneContext() {
  const sceneContext = useContext(SceneContext);
  return sceneContext;
}

// useThree can only be instantiated within a scene
// since JSX here is not DOM, so we can use
// this stub component to retrieve what we need
export function SceneContextSetup() {
  const { setScene } = useContext(SceneContext);
  const { scene, gl } = useThree();
  useEffect(() => {
    setScene(scene);
  }, [scene]);
  
  useEffect(() => {
    if(gl) {
      gl.outputColorSpace = SRGBColorSpace;
    }
  }, [gl]);

  return <></>;
}

type Props = { children: ReactNode };
export function SceneContextProvider({ children }: Props) {
  const [scene, handleSetScene] = useState<Scene>();
  const contextValue = useMemo<SceneContextOptions>(
    () => ({
      scene,
      setScene: (scene?: Scene) => handleSetScene(scene || undefined)
    }),
    [scene, handleSetScene]
  );

  return (
    <SceneContext.Provider value={contextValue}>
      {children}
    </SceneContext.Provider>
  );
}
