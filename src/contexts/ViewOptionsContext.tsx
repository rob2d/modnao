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
  guiPanelExpansionLevel: number;
  objectAddressesVisible: boolean;
  meshDisplayMode: MeshDisplayMode;
  disableBackfaceCulling: boolean;
  enableVertexColors: boolean;
  uvRegionsHighlighted: boolean;
  wireframeLineWidth: number;
  themeKey?: 'light' | 'dark';
  scenePalette?: ScenePalette;
  devOptionsVisible: boolean;
  renderAllModels: boolean;
  setAxesHelperVisible: (axesHelperVisible: boolean) => void;
  setSceneCursorVisible: (sceneCursorVisible: boolean) => void;
  setGuiPanelExpansionLevel: (expansionLevel: number) => void;
  setObjectAddressesVisible: (objectAddressesVisible: boolean) => void;
  setUvRegionsHighlighted: (uvRegionsHighlighted: boolean) => void;
  setMeshDisplayMode: (meshDisplayMode: MeshDisplayMode) => void;
  setDisableBackfaceCulling: (disableBackfaceCulling: boolean) => void;
  setEnableVertexColors: (enableVertexColors: boolean) => void;
  setWireframeLineWidth: (wireframeLineWidth: number) => void;
  setScenePalette: (_: ScenePalette | undefined) => void;
  setThemeKey: (theme: 'light' | 'dark') => void;
  toggleLightDarkTheme: () => void;
  setDevOptionsVisible: (devOptions: boolean) => void;
  setRenderAllModels: (devOptions: boolean) => void;
};

export const defaultValues: ViewOptions = {
  axesHelperVisible: true,
  sceneCursorVisible: true,
  guiPanelExpansionLevel: 2,
  objectAddressesVisible: false,
  meshDisplayMode: 'wireframe',
  disableBackfaceCulling: false,
  enableVertexColors: false,
  uvRegionsHighlighted: true,
  wireframeLineWidth: 3,
  themeKey: 'light',
  scenePalette: undefined,
  devOptionsVisible: false,
  renderAllModels: false,
  setAxesHelperVisible: (_: boolean) => null,
  setSceneCursorVisible: (_: boolean) => null,
  setGuiPanelExpansionLevel: (_: number) => null,
  setObjectAddressesVisible: (_: boolean) => null,
  setMeshDisplayMode: (_: MeshDisplayMode) => null,
  setDisableBackfaceCulling: (_: boolean) => null,
  setEnableVertexColors: (_: boolean) => null,
  setUvRegionsHighlighted: (_: boolean) => null,
  setWireframeLineWidth: (_: number) => null,
  setScenePalette: (_: ScenePalette | undefined) => null,
  setThemeKey: (_: 'light' | 'dark') => null,
  toggleLightDarkTheme: () => null,
  setDevOptionsVisible: (_: boolean) => null,
  setRenderAllModels: (_: boolean) => null
} as const;

export const ViewOptionsContext =
  React.createContext<ViewOptions>(defaultValues);

type Props = { children: ReactNode };

export function ViewOptionsContextProvider({ children }: Props) {
  const [axesHelperVisible, handleSetAxesHelperVisible] = useState(
    defaultValues.axesHelperVisible
  );
  const [renderAllModels, handleSetRenderAllModels] = useState(
    defaultValues.renderAllModels
  );
  const [objectAddressesVisible, handleSetObjectAddressesVisible] = useState(
    defaultValues.objectAddressesVisible
  );

  const [guiPanelExpansionLevel, handleSetGuiPanelExpansionLevel] = useState(
    defaultValues.guiPanelExpansionLevel
  );
  const [meshDisplayMode, handleSetMeshDisplayMode] =
    useState<MeshDisplayMode>('wireframe');
  const [disableBackfaceCulling, handleSetDisableBackfaceCulling] = useState(
    defaultValues.disableBackfaceCulling
  );

  const [enableVertexColors, handleSetEnableVertexColors] = useState(
    defaultValues.enableVertexColors
  );
  const [sceneCursorVisible, handleSetSceneCursorVisible] = useState(
    defaultValues.sceneCursorVisible
  );
  const [wireframeLineWidth, handleSetWireframeLineWidth] = useState(
    defaultValues.wireframeLineWidth
  );
  const [themeKey, handleSetThemeKey] = useState<'light' | 'dark' | undefined>(
    defaultValues.themeKey
  );

  const [scenePalette, handleSetScenePalette] = useState<
    ScenePalette | undefined
  >(defaultValues.scenePalette);

  const [uvRegionsHighlighted, handleSetUvRegionsHighlighted] =
    useState<boolean>(defaultValues.uvRegionsHighlighted);
  const [devOptionsVisible, handleSetDevOptionsVisible] = useState<boolean>(
    defaultValues.devOptionsVisible
  );

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
        (localStorage.getItem(StorageKeys.THEME_KEY) ||
          defaultValues.themeKey) as 'light' | 'dark'
      );
    }

    if (localStorage.getItem(StorageKeys.DISABLE_BACKFACE_CULLING) !== null) {
      handleSetDisableBackfaceCulling(
        JSON.parse(
          localStorage.getItem(StorageKeys.DISABLE_BACKFACE_CULLING) || 'true'
        ) as boolean
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

    if (localStorage.getItem(StorageKeys.DEV_OPTIONS_VISIBLE) !== null) {
      handleSetDevOptionsVisible(
        JSON.parse(
          localStorage.getItem(StorageKeys.DEV_OPTIONS_VISIBLE) || 'true'
        ) as boolean
      );
    }

    if (localStorage.getItem(StorageKeys.GUI_PANEL_EXPANSION_LEVEL) !== null) {
      handleSetGuiPanelExpansionLevel(
        Number(
          JSON.parse(
            localStorage.getItem(StorageKeys.GUI_PANEL_EXPANSION_LEVEL) || '1'
          )
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

  const setGuiPanelExpansionLevel = useCallback(
    (value: number) => {
      if (guiPanelExpansionLevel !== value) {
        localStorage.setItem(StorageKeys.GUI_PANEL_EXPANSION_LEVEL, `${value}`);
        handleSetGuiPanelExpansionLevel(value);
      }
    },
    [guiPanelExpansionLevel]
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

  const setEnableVertexColors = useCallback(
    (value: boolean) => {
      if (enableVertexColors !== value) {
        localStorage.setItem(StorageKeys.ENABLE_VERTEX_COLORS, `${value}`);
        handleSetEnableVertexColors(value);
      }
    },
    [enableVertexColors]
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

  const setDevOptionsVisible = useCallback(
    (value: boolean) => {
      if (devOptionsVisible !== value) {
        localStorage.setItem(
          StorageKeys.DEV_OPTIONS_VISIBLE,
          JSON.stringify(value)
        );
        handleSetDevOptionsVisible(value);
      }
    },
    [devOptionsVisible]
  );

  const setRenderAllModels = useCallback(
    (value: boolean) => {
      handleSetRenderAllModels(value);
    },
    [renderAllModels]
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
      disableBackfaceCulling,
      setDisableBackfaceCulling,
      enableVertexColors,
      setEnableVertexColors,
      uvRegionsHighlighted,
      setUvRegionsHighlighted,
      guiPanelExpansionLevel,
      setGuiPanelExpansionLevel,
      wireframeLineWidth,
      setWireframeLineWidth,
      scenePalette,
      setScenePalette,
      themeKey,
      setThemeKey,
      toggleLightDarkTheme,
      devOptionsVisible,
      setDevOptionsVisible,
      renderAllModels,
      setRenderAllModels
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
      enableVertexColors,
      setEnableVertexColors,
      uvRegionsHighlighted,
      setUvRegionsHighlighted,
      wireframeLineWidth,
      setWireframeLineWidth,
      guiPanelExpansionLevel,
      setGuiPanelExpansionLevel,
      scenePalette,
      setScenePalette,
      themeKey,
      setThemeKey,
      toggleLightDarkTheme,
      devOptionsVisible,
      setDevOptionsVisible,
      renderAllModels,
      setRenderAllModels
    ]
  );

  return (
    <ViewOptionsContext.Provider value={contextValue}>
      {children}
    </ViewOptionsContext.Provider>
  );
}

export default ViewOptionsContext;
