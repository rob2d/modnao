import React, { ReactNode, useContext, useMemo, useState } from 'react';
import { Scene } from 'three';

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
