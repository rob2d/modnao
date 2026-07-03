import { useCallback, useContext } from 'react';
import saveAs from 'file-saver';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { useSceneContext } from '@/contexts/SceneContext';
import SceneOptionsContext from '@/contexts/SceneOptionsContext';
import {
  selectHasLoadedTextureFile,
  selectModelCount,
  selectModelIndex
} from '@/selectors';
import { useAppDispatch, useAppSelector } from '@/storeTypings';
import { showError } from '@/modules/error-messages';

async function rotateDataUri(dataURI: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.src = dataURI;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

      const width = img.height;
      const height = img.width;

      canvas.width = width;
      canvas.height = height;

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((90 * Math.PI) / 180);
      ctx.scale(1, -1);
      ctx.drawImage(img, -width / 2, -height / 2);

      const rotatedDataURI = canvas.toDataURL();
      resolve(rotatedDataURI);
    };

    img.onerror = (error) => {
      reject(error);
    };
  });
}

const exporter = new GLTFExporter();

type GLTFImage = {
  uri: string;
};

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
  const dispatch = useAppDispatch();
  const {
    renderModelIndexes,
    setRenderModelIndexes,
    renderModelsStaggered,
    setRenderModelsStaggered,
    meshDisplayMode,
    setMeshDisplayMode
  } = useContext(SceneOptionsContext);
  const { scene } = useSceneContext();
  const modelIndex = useAppSelector(selectModelIndex);
  const modelCount = useAppSelector(selectModelCount);
  const hasLoadedTextureFile = useAppSelector(selectHasLoadedTextureFile);
  const polygonFileName =
    useAppSelector((s) => s.modelData.polygonFileName) || '';

  const onDownloadSceneFile = useCallback(async () => {
    const prevMeshDisplayMode = meshDisplayMode;
    const exportedModelIndexes = modelIndexes.filter(
      (modelIndex) => modelIndex >= 0 && modelIndex < modelCount
    );
    // must be rendering in mesh display mode for GLTF to render textures

    if (!scene) {
      dispatch(
        showError({
          title: 'Cannot export GLTF',
          message: 'no scene instantiated to get GLTF file'
        })
      );
      return;
    }

    if (!hasLoadedTextureFile) {
      dispatch(
        showError({
          title: 'Cannot export GLTF',
          message: 'no texture file loaded to export GLTF'
        })
      );
      return;
    }

    if (!exportedModelIndexes.length) {
      dispatch(
        showError({
          title: 'Cannot export GLTF',
          message: 'no models selected to export GLTF'
        })
      );
      return;
    }

    setMeshDisplayMode('textured');
    setRenderModelIndexes(exportedModelIndexes);
    setRenderModelsStaggered(staggerModels);
    await new Promise((r) => setTimeout(r, 100));

    try {
      const output = (await exporter.parseAsync(scene)) as {
        images: GLTFImage[];
      };

      const rotationPromises = output.images.map(async (img) => {
        const uri = await rotateDataUri(img.uri);
        return { ...img, uri };
      });

      const rotatedImages = await Promise.all(rotationPromises);
      output.images = rotatedImages;

      const file = new Blob([JSON.stringify(output, null, 2)], {
        type: 'application/object'
      });

      const modelNameSuffix =
        exportedModelIndexes.length === modelCount
          ? ''
          : exportedModelIndexes.length === 1
            ? `-${exportedModelIndexes[0]}`
            : '-custom';
      const name = `${polygonFileName.substring(
        0,
        polygonFileName.lastIndexOf('.')
      )}${modelNameSuffix}`;

      saveAs(file, `${name}.mn.gltf`);
    } finally {
      await new Promise((r) => setTimeout(r, 100));
      setRenderModelIndexes(undefined);
      setRenderModelsStaggered(true);
      setMeshDisplayMode(prevMeshDisplayMode);
    }
  }, [
    scene,
    dispatch,
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
