/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';
import { StorageKeys } from '@/constants/StorageKeys';
import { ScenePalette, useMediaQuery } from '@mui/material';
import themes from '@/theming/themes';

export type MeshDisplayMode = 'wireframe' | 'textured';

export type ViewOptions = {
  axesHelperVisible: boolean;
  sceneCursorVisible: boolean;
  guiPanelVisible: boolean;
  objectAddressesVisible: boolean;
  meshDisplayMode: MeshDisplayMode;
  disableBackfaceCulling: boolean;
  uvRegionsHighlighted: boolean;
  wireframeLineWidth: number;
  themeKey?: 'light' | 'dark';
  scenePalette?: ScenePalette;
  setAxesHelperVisible: (axesHelperVisible: boolean) => void;
  setSceneCursorVisible: (sceneCursorVisible: boolean) => void;
  setGuiPanelVisible: (guiPanelVisible: boolean) => void;
  setObjectAddressesVisible: (objectAddressesVisible: boolean) => void;
  setUvRegionsHighlighted: (uvRegionsHighlighted: boolean) => void;
  setMeshDisplayMode: (meshDisplayMode: MeshDisplayMode) => void;
  setDisableBackfaceCulling: (disableBackfaceCulling: boolean) => void;
  setWireframeLineWidth: (wireframeLineWidth: number) => void;
  setScenePalette: (_: ScenePalette | undefined) => void;
  setThemeKey: (theme: 'light' | 'dark') => void;
  toggleLightDarkTheme: () => void;
};

export const ViewOptionsContext = React.createContext<ViewOptions>({
  axesHelperVisible: true,
  sceneCursorVisible: true,
  guiPanelVisible: true,
  objectAddressesVisible: true,
  meshDisplayMode: 'wireframe',
  disableBackfaceCulling: false,
  uvRegionsHighlighted: true,
  wireframeLineWidth: 3,
  themeKey: undefined,
  scenePalette: undefined,
  setAxesHelperVisible: (_: boolean) => null,
  setSceneCursorVisible: (_: boolean) => null,
  setGuiPanelVisible: (_: boolean) => null,
  setObjectAddressesVisible: (_: boolean) => null,
  setMeshDisplayMode: (_: MeshDisplayMode) => null,
  setDisableBackfaceCulling: (_: boolean) => null,
  setUvRegionsHighlighted: (_: boolean) => null,
  setWireframeLineWidth: (_: number) => null,
  setScenePalette: (_: ScenePalette | undefined) => null,
  setThemeKey: (_: 'light' | 'dark') => null,
  toggleLightDarkTheme: () => null
});

type Props = { children: ReactNode };

export function ViewOptionsContextProvider({ children }: Props) {
  const [axesHelperVisible, handleSetAxesHelperVisible] = useState(true);
  const [objectAddressesVisible, handleSetObjectAddressesVisible] =
    useState(true);
  const [guiPanelVisible, handleSetGuiPanelVisible] = useState(true);
  const [meshDisplayMode, handleSetMeshDisplayMode] =
    useState<MeshDisplayMode>('wireframe');
  const [disableBackfaceCulling, handleSetDisableBackfaceCulling] =
    useState(false);
  const [sceneCursorVisible, handleSetSceneCursorVisible] = useState(true);
  const [wireframeLineWidth, handleSetWireframeLineWidth] = useState(3);
  const [themeKey, handleSetThemeKey] = useState<'light' | 'dark' | undefined>(
    undefined
  );

  const [scenePalette, handleSetScenePalette] = useState<
    ScenePalette | undefined
  >(undefined);

  const [uvRegionsHighlighted, handleSetUvRegionsHighlighted] =
    useState<boolean>(false);

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

    if (localStorage.getItem(StorageKeys.THEME_KEY) !== null) {
      handleSetThemeKey(
        JSON.parse(
          localStorage.getItem(StorageKeys.THEME_KEY) || 'undefined'
        ) as 'light' | 'dark'
      );
    }

    if (localStorage.getItem(StorageKeys.SCENE_PALETTE) !== null) {
      handleSetScenePalette(
        JSON.parse(
          localStorage.getItem(StorageKeys.SCENE_PALETTE) || 'undefined'
        ) as ScenePalette | undefined
      );
    }

    if (localStorage.getItem(StorageKeys.UV_REGIONS_HIGHLIGHTED) !== null) {
      handleSetUvRegionsHighlighted(
        JSON.parse(
          localStorage.getItem(StorageKeys.UV_REGIONS_HIGHLIGHTED) || 'true'
        ) as boolean
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

  const setDisableBackfaceCulling = useCallback(
    (value: boolean) => {
      if (disableBackfaceCulling !== value) {
        localStorage.setItem(StorageKeys.DISABLE_BACKFACE_CULLING, `${value}`);
        handleSetDisableBackfaceCulling(value);
      }
    },
    [disableBackfaceCulling]
  );

  const setUvRegionsHighlighted = useCallback(
    (value: boolean) => {
      if (uvRegionsHighlighted !== value) {
        localStorage.setItem(StorageKeys.UV_REGIONS_HIGHLIGHTED, `${value}`);
        handleSetUvRegionsHighlighted(value);
      }
    },
    [uvRegionsHighlighted]
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

  const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const setScenePalette = useCallback(
    (value: ScenePalette | undefined) => {
      if (scenePalette !== value) {
        localStorage.setItem(StorageKeys.SCENE_PALETTE, JSON.stringify(value));
        handleSetScenePalette(value);
      }
    },
    [scenePalette]
  );

  const setThemeKey = useCallback((value: 'light' | 'dark') => {
    if (themeKey !== value) {
      localStorage.setItem(StorageKeys.THEME_KEY, JSON.stringify(value));
      handleSetThemeKey(value);
    }
  }, []);

  /**
   * toggles between light or dark theme, or performs a reset
   * if the theme has been edited by the user
   */
  const toggleLightDarkTheme = useCallback(() => {
    const currentSceneTheme =
      themes[isDarkMode ? 'dark' : 'light'].palette.scene;
    const altSceneTheme = themes[isDarkMode ? 'light' : 'dark'].palette.scene;
    const isThemeCurrent = scenePalette === currentSceneTheme;
    const isThemeAlt = scenePalette === altSceneTheme;

    if ((!isThemeCurrent && !isThemeAlt) || isThemeAlt) {
      setScenePalette(currentSceneTheme);
      setThemeKey(isDarkMode ? 'dark' : 'light');
    } else {
      setScenePalette(altSceneTheme);
      setThemeKey(isDarkMode ? 'light' : 'dark');
    }
  }, [scenePalette, isDarkMode]);

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
      disableBackfaceCulling,
      setDisableBackfaceCulling,
      uvRegionsHighlighted,
      setUvRegionsHighlighted,
      guiPanelVisible,
      setGuiPanelVisible,
      wireframeLineWidth,
      setWireframeLineWidth,
      scenePalette,
      setScenePalette,
      themeKey,
      setThemeKey,
      toggleLightDarkTheme
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
      disableBackfaceCulling,
      setDisableBackfaceCulling,
      uvRegionsHighlighted,
      setUvRegionsHighlighted,
      wireframeLineWidth,
      setWireframeLineWidth,
      guiPanelVisible,
      setGuiPanelVisible,
      scenePalette,
      setScenePalette,
      themeKey,
      setThemeKey,
      toggleLightDarkTheme
    ]
  );

  return (
    <ViewOptionsContext.Provider value={contextValue}>
      {children}
    </ViewOptionsContext.Provider>
  );
}

export default ViewOptionsContext;
