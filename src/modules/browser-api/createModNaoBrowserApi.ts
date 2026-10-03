import { showError } from '@/modules/error-messages';
import { handleFileInput } from '@/modules/model-data/hooks/useSupportedFilePicker';
import {
  $modelIndex,
  $textureIndex,
  setObjectViewedIndex
} from '@/modules/object-viewer';
import {
  $models,
  $polygonFileName,
  $textureDefs
} from '@/modules/model-data/modelDataStore';
import { $contentViewMode } from '@/derivedState';

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
          $polygonFileName.get()
        )
    }),
    object: Object.freeze({
      get viewedIndex() {
        return $contentViewMode.get() === 'polygons'
          ? $modelIndex.get()
          : $textureIndex.get();
      },
      set viewedIndex(index) {
        if (!Number.isInteger(index)) {
          throw new TypeError('Object index must be an integer');
        }

        void setObjectViewedIndex(index);
      },
      get selectedIndexes() {
        if ($contentViewMode.get() === 'polygons') {
          return $models
            .get()
            .reduce<
              number[]
            >((indexes, model, index) => (model.meshes.length ? [...indexes, index] : indexes), []);
        }

        return $textureDefs.get().map((_, index) => index);
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
