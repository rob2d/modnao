/**
 * mapping of user-defined settings that
 * persist keys to values
 */
export const StorageKeys = {
  MESH_DISPLAY_MODE: 'meshDisplayMode',
  WIREFRAME_LINE_WIDTH: 'wireframeLineWidth',
  AXES_HELPER_VISIBLE: 'axesHelperVisible',
  OBJECT_ADDRESSES_VISIBLE: 'objectAddressesVisible',
  SCENE_CURSOR_VISIBLE: 'sceneCursorVisible',
  GUI_PANEL_VISIBLE: 'guiPanelVisible',
  THEME_KEY: 'themeKey',
  SCENE_PALETTE: 'scenePalette',
  DISABLE_BACKFACE_CULLING: 'disableBackfaceCulling',
  UV_REGIONS_HIGHLIGHTED: 'uvRegionsHighlighted',
  DEV_OPTIONS_VISIBLE: 'devOptionsVisible',
  ENABLE_VERTEX_COLORS: 'enableVertexColors'
} as const;
