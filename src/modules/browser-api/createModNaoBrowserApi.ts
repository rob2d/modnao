import { showError } from '@/modules/error-messages';
import { handleFileInput } from '@/modules/model-data/hooks/useSupportedFilePicker';
import { setObjectViewedIndex } from '@/modules/object-viewer';
import { $contentViewMode } from '@/selectors';
import { getState } from '@/store';

export interface ModNaoBrowserApiController {
  mount: () => () => void;
  registerCamera: (camera: ModNaoCameraApi) => () => void;
  registerScene: (scene: ModNaoSceneApi) => () => void;
}

export default function createModNaoBrowserApi(): ModNaoBrowserApiController {
  let camera: ModNaoCameraApi | undefined;
  let scene: ModNaoSceneApi | undefined;

  const api: ModNaoBrowserApi = Object.freeze({
    get camera() {
      return camera;
    },
    files: Object.freeze({
      load: (files: File[] | FileList) =>
        handleFileInput(
          Array.from(files),
          (message) => showError({ title: 'Invalid file selection', message }),
          getState().modelData.polygonFileName
        )
    }),
    object: Object.freeze({
      get viewedIndex() {
        const state = getState();

        return $contentViewMode.value === 'polygons'
          ? state.objectViewer.modelIndex
          : state.objectViewer.textureIndex;
      },
      set viewedIndex(index) {
        if (!Number.isInteger(index)) {
          throw new TypeError('Object index must be an integer');
        }

        void setObjectViewedIndex(index);
      },
      get selectedIndexes() {
        const state = getState();

        if ($contentViewMode.value === 'polygons') {
          return state.modelData.models.reduce<number[]>(
            (indexes, model, index) =>
              model.meshes.length ? [...indexes, index] : indexes,
            []
          );
        }

        return state.modelData.textureDefs.map((_, index) => index);
      }
    }),
    get scene() {
      return scene;
    }
  });

  return Object.freeze({
    mount: () => {
      const previousApi = window.modNao;
      window.modNao = api;

      return () => {
        if (window.modNao !== api) {
          return;
        }

        if (previousApi) {
          window.modNao = previousApi;
        } else {
          delete window.modNao;
        }
      };
    },
    registerCamera: (nextCamera: ModNaoCameraApi) => {
      camera = nextCamera;

      return () => {
        if (camera === nextCamera) {
          camera = undefined;
        }
      };
    },
    registerScene: (nextScene: ModNaoSceneApi) => {
      scene = nextScene;

      return () => {
        if (scene === nextScene) {
          scene = undefined;
        }
      };
    }
  });
}
