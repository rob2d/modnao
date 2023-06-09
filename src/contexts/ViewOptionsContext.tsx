/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {
  useMemo,
  useState,
  ReactNode,
  useCallback,
  useEffect
} from 'react';
import { StorageKeys } from '@/constants/StorageKeys';

export type MeshDisplayMode = 'wireframe' | 'textured';

export type ViewOptions = {
  axesHelperVisible: boolean;
  sceneCursorVisible: boolean;
  guiPanelVisible: boolean;
  objectAddressesVisible: boolean;
  meshDisplayMode: MeshDisplayMode;
  wireframeLineWidth: number;
  setAxesHelperVisible: (axesHelperVisible: boolean) => void;
  setSceneCursorVisible: (sceneCursorVisible: boolean) => void;
  setGuiPanelVisible: (guiPanelVisible: boolean) => void;
  setObjectAddressesVisible: (objectAddressesVisible: boolean) => void;
  setMeshDisplayMode: (meshDisplayMode: MeshDisplayMode) => void;
  setWireframeLineWidth: (wireframeLineWidth: number) => void;
};

export const ViewOptionsContext = React.createContext<ViewOptions>({
  axesHelperVisible: true,
  sceneCursorVisible: true,
  guiPanelVisible: true,
  objectAddressesVisible: true,
  meshDisplayMode: 'wireframe',
  wireframeLineWidth: 3,
  setAxesHelperVisible: (_: boolean) => null,
  setSceneCursorVisible: (_: boolean) => null,
  setGuiPanelVisible: (_: boolean) => null,
  setObjectAddressesVisible: (_: boolean) => null,
  setMeshDisplayMode: (_: MeshDisplayMode) => null,
  setWireframeLineWidth: (_: number) => null
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
  const [wireframeLineWidth, handleSetWireframeLineWidth] = useState(3);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const { localStorage } = window;
    if (localStorage.getItem(StorageKeys.MESH_DISPLAY_MODE) !== null) {
      handleSetMeshDisplayMode(
        (localStorage.getItem(StorageKeys.MESH_DISPLAY_MODE) ||
          'wireframe') as MeshDisplayMode
      );
    }

    if (localStorage.getItem(StorageKeys.AXES_HELPER_VISIBLE) !== null) {
      handleSetAxesHelperVisible(
        JSON.parse(
          localStorage.getItem(StorageKeys.AXES_HELPER_VISIBLE) || 'true'
        ) as boolean
      );
    }

    if (localStorage.getItem(StorageKeys.OBJECT_ADDRESSES_VISIBLE) !== null) {
      handleSetObjectAddressesVisible(
        JSON.parse(
          localStorage.getItem(StorageKeys.OBJECT_ADDRESSES_VISIBLE) || 'true'
        ) as boolean
      );
    }

    if (localStorage.getItem(StorageKeys.WIREFRAME_LINE_WIDTH) !== null) {
      handleSetWireframeLineWidth(
        Number(
          localStorage.getItem(StorageKeys.WIREFRAME_LINE_WIDTH) || 4
        ) as number
      );
    }
  }, []);

  const setObjectAddressesVisible = useCallback(
    (value: boolean) => {
      if (objectAddressesVisible !== value) {
        localStorage.setItem(StorageKeys.OBJECT_ADDRESSES_VISIBLE, `${value}`);
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
        localStorage.setItem(StorageKeys.AXES_HELPER_VISIBLE, `${value}`);
        handleSetAxesHelperVisible(value);
      }
    },
    [axesHelperVisible]
  );

  const setMeshDisplayMode = useCallback(
    (value: MeshDisplayMode) => {
      if (meshDisplayMode !== value) {
        localStorage.setItem(StorageKeys.MESH_DISPLAY_MODE, `${value}`);
        handleSetMeshDisplayMode(value);
      }
    },
    [meshDisplayMode]
  );

  const setWireframeLineWidth = useCallback(
    (value: number) => {
      if (wireframeLineWidth !== value) {
        localStorage.setItem(StorageKeys.WIREFRAME_LINE_WIDTH, `${value}`);
        handleSetWireframeLineWidth(value);
      }
    },
    [wireframeLineWidth]
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
      setGuiPanelVisible,
      wireframeLineWidth,
      setWireframeLineWidth
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
      wireframeLineWidth,
      setWireframeLineWidth,
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
