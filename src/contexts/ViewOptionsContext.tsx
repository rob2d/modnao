/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {
  useMemo,
  useState,
  ReactNode,
  useCallback,
  useEffect
} from 'react';

export type MeshDisplayMode = 'wireframe' | 'textured';

export type ViewOptions = {
  axesHelperVisible: boolean;
  sceneCursorVisible: boolean;
  guiPanelVisible: boolean;
  objectAddressesVisible: boolean;
  meshDisplayMode: MeshDisplayMode;
  setAxesHelperVisible: (axesHelperVisible: boolean) => void;
  setSceneCursorVisible: (sceneCursorVisible: boolean) => void;
  setGuiPanelVisible: (guiPanelVisible: boolean) => void;
  setObjectAddressesVisible: (objectAddressesVisible: boolean) => void;
  setMeshDisplayMode: (meshDisplayMode: MeshDisplayMode) => void;
};

export const ViewOptionsContext = React.createContext<ViewOptions>({
  axesHelperVisible: true,
  sceneCursorVisible: true,
  guiPanelVisible: true,
  objectAddressesVisible: true,
  meshDisplayMode: 'wireframe',
  setAxesHelperVisible: (_: boolean) => null,
  setSceneCursorVisible: (_: boolean) => null,
  setGuiPanelVisible: (_: boolean) => null,
  setObjectAddressesVisible: (_: boolean) => null,
  setMeshDisplayMode: (_: MeshDisplayMode) => null
});

type Props = { children: ReactNode };

export function ViewOptionsContextProvider({ children }: Props) {
  const [axesHelperVisible, handleSetAxesHelperVisible] = useState(true);
  const [objectAddressesVisible, handleSetObjectAddressesVisible] =
    useState(true);
  const [guiPanelVisible, handleSetGuiPanelVisible] = useState(true);
  const [meshDisplayMode, handleSetMeshDisplayMode] =
    useState<MeshDisplayMode>('wireframe');
  const [sceneCursorVisible, handleSetSceneCursorVisible] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const { localStorage } = window;
    if (localStorage.getItem('meshDisplayMode') !== null) {
      handleSetMeshDisplayMode(
        (localStorage.getItem('meshDisplayMode') ||
          'wireframe') as MeshDisplayMode
      );
    }

    if (localStorage.getItem('axesHelperVisible') !== null) {
      handleSetAxesHelperVisible(
        JSON.parse(
          localStorage.getItem('axesHelperVisible') || 'true'
        ) as boolean
      );
    }

    if (localStorage.getItem('objectAddressesVisible') !== null) {
      handleSetObjectAddressesVisible(
        JSON.parse(
          localStorage.getItem('objectAddressesVisible') || 'true'
        ) as boolean
      );
    }
  }, []);

  const setObjectAddressesVisible = useCallback(
    (value: boolean) => {
      if (objectAddressesVisible !== value) {
        localStorage.setItem('objectAddressesVisible', `${value}`);
        handleSetObjectAddressesVisible(value);
      }
    },
    [objectAddressesVisible]
  );

  const setSceneCursorVisible = useCallback(
    (value: boolean) => {
      if (sceneCursorVisible !== value) {
        handleSetSceneCursorVisible(value);
      }
    },
    [sceneCursorVisible]
  );

  const setGuiPanelVisible = useCallback(
    (value: boolean) => {
      if (guiPanelVisible !== value) {
        handleSetGuiPanelVisible(value);
      }
    },
    [guiPanelVisible]
  );

  const setAxesHelperVisible = useCallback(
    (value: boolean) => {
      if (axesHelperVisible !== value) {
        localStorage.setItem('axesHelperVisible', `${value}`);
        handleSetAxesHelperVisible(value);
      }
    },
    [axesHelperVisible]
  );

  const setMeshDisplayMode = useCallback(
    (value: MeshDisplayMode) => {
      if (meshDisplayMode !== value) {
        localStorage.setItem('meshDisplayMode', `${value}`);
        handleSetMeshDisplayMode(value);
      }
    },
    [meshDisplayMode]
  );

  const contextValue = useMemo<ViewOptions>(
    () => ({
      objectAddressesVisible,
      setObjectAddressesVisible,
      sceneCursorVisible,
      setSceneCursorVisible,
      axesHelperVisible,
      setAxesHelperVisible,
      meshDisplayMode,
      setMeshDisplayMode,
      guiPanelVisible,
      setGuiPanelVisible
    }),
    [
      objectAddressesVisible,
      setObjectAddressesVisible,
      sceneCursorVisible,
      setSceneCursorVisible,
      axesHelperVisible,
      setAxesHelperVisible,
      meshDisplayMode,
      setMeshDisplayMode,
      guiPanelVisible,
      setGuiPanelVisible
    ]
  );

  return (
    <ViewOptionsContext.Provider value={contextValue}>
      {children}
    </ViewOptionsContext.Provider>
  );
}

export default ViewOptionsContext;
