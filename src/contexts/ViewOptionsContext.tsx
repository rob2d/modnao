import React, {
  useMemo,
  useState,
  ReactNode,
  useCallback,
  useEffect
} from 'react';

export type MeshDisplayMode = 'wireframe' | 'textured';

export type ViewOptions = {
  showAxesHelper: boolean;
  showSceneCursor: boolean;
  showGuiPanel: boolean;
  showPolygonAddresses: boolean;
  meshDisplayMode: MeshDisplayMode;
  setShowAxesHelper: (showAxesHelper: boolean) => void;
  setShowSceneCursor: (showSceneCursor: boolean) => void;
  setShowGuiPanel: (showGuiPanel: boolean) => void;
  setShowPolygonAddresses: (showPolygonAddresses: boolean) => void;
  setMeshDisplayMode: (meshDisplayMode: MeshDisplayMode) => void;
};

export const ViewOptionsContext = React.createContext<ViewOptions>({
  showAxesHelper: true,
  showSceneCursor: true,
  showGuiPanel: true,
  showPolygonAddresses: true,
  meshDisplayMode: 'wireframe',
  setShowAxesHelper: (_: boolean) => null,
  setShowSceneCursor: (_: boolean) => null,
  setShowGuiPanel: (_: boolean) => null,
  setShowPolygonAddresses: (_: boolean) => null,
  setMeshDisplayMode: (_: MeshDisplayMode) => null
});

type Props = { children: ReactNode };

export function ViewOptionsContextProvider({ children }: Props) {
  const [showAxesHelper, handleSetShowAxesHelper] = useState(true);
  const [showPolygonAddresses, handleSetShowPolygonAddresses] = useState(true);
  const [showGuiPanel, handleSetShowGuiPanel] = useState(true);
  const [meshDisplayMode, handleSetMeshDisplayMode] =
    useState<MeshDisplayMode>('wireframe');
  const [showSceneCursor, handleSetShowSceneCursor] = useState(true);

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

    if (localStorage.getItem('showAxesHelper') !== null) {
      handleSetShowAxesHelper(
        JSON.parse(localStorage.getItem('showAxesHelper') || 'true') as boolean
      );
    }

    if (localStorage.getItem('showPolygonAddresses') !== null) {
      handleSetShowPolygonAddresses(
        JSON.parse(
          localStorage.getItem('showPolygonAddresses') || 'true'
        ) as boolean
      );
    }
  }, []);

  const setShowPolygonAddresses = useCallback(
    (value: boolean) => {
      if (showPolygonAddresses !== value) {
        localStorage.setItem('showPolygonAddresses', `${value}`);
        handleSetShowPolygonAddresses(value);
      }
    },
    [showPolygonAddresses]
  );

  const setShowSceneCursor = useCallback(
    (value: boolean) => {
      if (showSceneCursor !== value) {
        handleSetShowSceneCursor(value);
      }
    },
    [showSceneCursor]
  );

  const setShowGuiPanel = useCallback(
    (value: boolean) => {
      if (showGuiPanel !== value) {
        handleSetShowGuiPanel(value);
      }
    },
    [showGuiPanel]
  );

  const setShowAxesHelper = useCallback(
    (value: boolean) => {
      if (showAxesHelper !== value) {
        localStorage.setItem('showAxesHelper', `${value}`);
        handleSetShowAxesHelper(value);
      }
    },
    [showAxesHelper]
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
      showPolygonAddresses,
      setShowPolygonAddresses,
      showSceneCursor,
      setShowSceneCursor,
      showAxesHelper,
      setShowAxesHelper,
      meshDisplayMode,
      setMeshDisplayMode,
      showGuiPanel,
      setShowGuiPanel
    }),
    [
      showPolygonAddresses,
      setShowPolygonAddresses,
      showSceneCursor,
      setShowSceneCursor,
      showAxesHelper,
      setShowAxesHelper,
      meshDisplayMode,
      setMeshDisplayMode,
      showGuiPanel,
      setShowGuiPanel
    ]
  );

  return (
    <ViewOptionsContext.Provider value={contextValue}>
      {children}
    </ViewOptionsContext.Provider>
  );
}

export default ViewOptionsContext;
