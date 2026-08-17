type ModNaoCameraPose =
  import('@/components/scene/sceneCameraPositionStore').SceneCameraPosition;

interface ModNaoCameraApi {
  getPose: () => ModNaoCameraPose;
  setPose: (pose: ModNaoCameraPose) => ModNaoCameraPose;
}

interface ModNaoSceneApi {
  readonly options: import('@/contexts/SceneOptionsContext').SceneOptions;
}

interface ModNaoBrowserApi {
  camera?: ModNaoCameraApi;
  scene?: ModNaoSceneApi;
}

interface Window {
  modNao?: ModNaoBrowserApi;
}
