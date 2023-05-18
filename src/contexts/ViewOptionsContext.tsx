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
  setShowAxesHelper: (showAxesHelper: boolean) => void;
  showPolygonAddresses: boolean;
  setShowPolygonAddresses: (showPolygonAddresses: boolean) => void;
  meshDisplayMode: MeshDisplayMode;
  setMeshDisplayMode: (meshDisplayMode: MeshDisplayMode) => void;
};

export const ViewOptionsContext = React.createContext<ViewOptions>({
  showAxesHelper: true,
  showPolygonAddresses: true,
  meshDisplayMode: 'wireframe',
  setShowAxesHelper: (_: boolean) => null,
  setShowPolygonAddresses: (_: boolean) => null,
  setMeshDisplayMode: (_: MeshDisplayMode) => null
});

type Props = { children: ReactNode };

export function ViewOptionsContextProvider({ children }: Props) {
  const [showAxesHelper, handleSetShowAxesHelper] = useState(true);
  const [showPolygonAddresses, handleSetShowPolygonAddresses] = useState(true);
  const [meshDisplayMode, handleSetMeshDisplayMode] =
    useState<MeshDisplayMode>('wireframe');

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

  const contextValue = useMemo(
    () => ({
      showPolygonAddresses,
      setShowPolygonAddresses,
      showAxesHelper,
      setShowAxesHelper,
      meshDisplayMode,
      setMeshDisplayMode
    }),
    [
      showPolygonAddresses,
      setShowPolygonAddresses,
      showAxesHelper,
      setShowAxesHelper,
      meshDisplayMode,
      setMeshDisplayMode
    ]
  );

  return (
    <ViewOptionsContext.Provider value={contextValue}>
      {children}
    </ViewOptionsContext.Provider>
  );
}

export default ViewOptionsContext;
