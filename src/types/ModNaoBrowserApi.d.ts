type ModNaoCameraVector =
  import('@/components/scene/sceneCameraPositionStore').SceneCameraPosition['position'];

type ModNaoCameraEasing = 'linear' | 'easeInOut' | 'easeIn' | 'easeOut';

interface ModNaoCameraAnimationOptions {
  duration?: number;
  easing?: ModNaoCameraEasing;
}

interface ModNaoCameraMoveOptions extends ModNaoCameraAnimationOptions {
  position?: ModNaoCameraVector;
  target?: ModNaoCameraVector;
}

interface ModNaoCameraOrbitOptions extends ModNaoCameraAnimationOptions {
  azimuth: number;
  distance: number;
  polar: number;
  target?: ModNaoCameraVector;
}

interface ModNaoCameraApi {
  position: ModNaoCameraVector;
  target: ModNaoCameraVector;
  moveTo: (options: ModNaoCameraMoveOptions) => Promise<void>;
  orbitTo: (options: ModNaoCameraOrbitOptions) => Promise<void>;
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
