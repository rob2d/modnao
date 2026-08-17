type ModNaoCameraVector =
  import('@/components/scene/sceneCameraPositionStore').SceneCameraPosition['position'];

interface ModNaoCameraApi {
  position: ModNaoCameraVector;
  target: ModNaoCameraVector;
}

interface ModNaoSceneApi {
  readonly options: import('@/contexts/SceneOptionsContext').SceneOptions;
}

interface ModNaoFilesApi {
  load: (files: File[] | FileList) => Promise<void>;
}

interface ModNaoBrowserApi {
  readonly camera: ModNaoCameraApi | undefined;
  readonly files: ModNaoFilesApi;
  readonly scene: ModNaoSceneApi | undefined;
}

interface Window {
  modNao?: ModNaoBrowserApi;
}
