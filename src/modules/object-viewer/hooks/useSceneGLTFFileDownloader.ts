import { useSceneContext } from '@/contexts/SceneContext';
import SceneOptionsContext from '@/contexts/SceneOptionsContext';
import { showError } from '@/modules/error-messages';
import {
  $polygonFileName,
  $textureFileName
} from '@/modules/model-data/modelDataStore';
import { $modelIndex } from '@/modules/object-viewer/objectViewerStore';
import { $modelCount } from '@/selectors';
import saveAs from 'file-saver';
import { useCallback, useContext } from 'react';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

const exporter = new GLTFExporter();

interface SceneGLTFFileDownloaderOptions {
  modelIndexes: number[];
  staggerModels: boolean;
}

/**
 * Downloads a scene as a GLTF file;
 * This was somewhat hacky, due to a request from a very niche
 * use-case of porting to MVC3 -- not original/main feature of
 * this app - hence literally rendering the scene and then output it to a GLTF.
 * R3F has a convenient export function once we've rendered so it didn't
 * make sense not to agree to this request.
 *
 * @param options GLTF export render options
 * @returns
 */
export default function useSceneGLTFFileDownloader({
  modelIndexes,
  staggerModels
}: SceneGLTFFileDownloaderOptions) {
  'use no memo';

  const {
    renderModelIndexes,
    setRenderModelIndexes,
    renderModelsStaggered,
    setRenderModelsStaggered,
    meshDisplayMode,
    setMeshDisplayMode
  } = useContext(SceneOptionsContext);
  const { scene } = useSceneContext();
  const modelIndex = $modelIndex.value;
  const modelCount = $modelCount.value;
  const hasLoadedTextureFile = Boolean($textureFileName.value);
  const polygonFileName = $polygonFileName.value || '';

  const onDownloadSceneFile = useCallback(async () => {
    const prevMeshDisplayMode = meshDisplayMode;
    const exportedModelIndexes = modelIndexes.filter(
      (modelIndex) => modelIndex >= 0 && modelIndex < modelCount
    );
    // must be rendering in mesh display mode for GLTF to render textures

    if (!scene) {
      showError({
        title: 'Cannot export GLTF',
        message: 'no scene instantiated to get GLTF file'
      });
      return;
    }

    if (!hasLoadedTextureFile) {
      showError({
        title: 'Cannot export GLTF',
        message: 'no texture file loaded to export GLTF'
      });
      return;
    }

    if (!exportedModelIndexes.length) {
      showError({
        title: 'Cannot export GLTF',
        message: 'no models selected to export GLTF'
      });
      return;
    }

    setMeshDisplayMode('textured');
    setRenderModelIndexes(exportedModelIndexes);
    setRenderModelsStaggered(staggerModels);
    await new Promise((r) => setTimeout(r, 100));

    try {
      const output = await exporter.parseAsync(scene);

      const file = new Blob([JSON.stringify(output, null, 2)], {
        type: 'application/object'
      });

      const modelNameSuffix =
        exportedModelIndexes.length === modelCount
          ? ''
          : exportedModelIndexes.length === 1
            ? `-${exportedModelIndexes[0]}`
            : '-custom';
      const name = `${polygonFileName.substring(0, polygonFileName.lastIndexOf('.'))}${modelNameSuffix}`;

      saveAs(file, `${name}.mn.gltf`);
    } finally {
      await new Promise((r) => setTimeout(r, 100));
      setRenderModelIndexes(undefined);
      setRenderModelsStaggered(true);
      setMeshDisplayMode(prevMeshDisplayMode);
    }
  }, [
    scene,
    hasLoadedTextureFile,
    modelCount,
    modelIndexes,
    polygonFileName,
    setRenderModelIndexes,
    setRenderModelsStaggered,
    staggerModels,
    meshDisplayMode,
    setMeshDisplayMode
  ]);

  return onDownloadSceneFile;
}
