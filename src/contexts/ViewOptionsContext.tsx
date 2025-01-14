/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { ReactNode, useCallback, useMemo } from 'react';
import { StorageKeys } from '@/constants/StorageKeys';
import { ScenePalette, useMediaQuery } from '@mui/material';
import themes from '@/theming/themes';
import useViewOptionSetting from '@/hooks/useViewOptionSetting';

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

const ViewOptionsContext = React.createContext<ViewOptions>(defaultValues);

type Props = { children: ReactNode };

export function ViewOptionsContextProvider({ children }: Props) {
  const [axesHelperVisible, setAxesHelperVisible] =
    useViewOptionSetting<boolean>(
      defaultValues.axesHelperVisible,
      StorageKeys.AXES_HELPER_VISIBLE
    );
  const [sceneCursorVisible, setSceneCursorVisible] =
    useViewOptionSetting<boolean>(defaultValues.sceneCursorVisible);

  const [guiPanelExpansionLevel, setGuiPanelExpansionLevel] =
    useViewOptionSetting<number>(
      defaultValues.guiPanelExpansionLevel,
      StorageKeys.GUI_PANEL_EXPANSION_LEVEL
    );

  const [renderAllModels, setRenderAllModels] = useViewOptionSetting<boolean>(
    defaultValues.renderAllModels
  );

  const [objectAddressesVisible, setObjectAddressesVisible] =
    useViewOptionSetting<boolean>(defaultValues.objectAddressesVisible);

  const [meshDisplayMode, setMeshDisplayMode] =
    useViewOptionSetting<MeshDisplayMode>(
      defaultValues.meshDisplayMode,
      StorageKeys.MESH_DISPLAY_MODE
    );

  const [disableBackfaceCulling, setDisableBackfaceCulling] =
    useViewOptionSetting<boolean>(
      defaultValues.disableBackfaceCulling,
      StorageKeys.DISABLE_BACKFACE_CULLING
    );

  const [enableVertexColors, setEnableVertexColors] =
    useViewOptionSetting<boolean>(
      defaultValues.enableVertexColors,
      StorageKeys.ENABLE_VERTEX_COLORS
    );

  const [wireframeLineWidth, setWireframeLineWidth] =
    useViewOptionSetting<number>(
      defaultValues.wireframeLineWidth,
      StorageKeys.WIREFRAME_LINE_WIDTH
    );

  const [uvRegionsHighlighted, setUvRegionsHighlighted] =
    useViewOptionSetting<boolean>(
      defaultValues.uvRegionsHighlighted,
      StorageKeys.UV_REGIONS_HIGHLIGHTED
    );

  const [devOptionsVisible, setDevOptionsVisible] =
    useViewOptionSetting<boolean>(
      defaultValues.devOptionsVisible,
      StorageKeys.DEV_OPTIONS_VISIBLE
    );

  const [themeKey, setThemeKey] = useViewOptionSetting<
    'light' | 'dark' | undefined
  >(defaultValues.themeKey, StorageKeys.THEME_KEY);

  const [scenePalette, setScenePalette] = useViewOptionSetting<
    ScenePalette | undefined
  >(defaultValues.scenePalette, StorageKeys.SCENE_PALETTE);

  const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

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
