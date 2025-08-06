import { useCallback, useContext } from 'react';
import saveAs from 'file-saver';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { useSceneContext } from '@/contexts/SceneContext';
import ViewOptionsContext from '@/contexts/ViewOptionsContext';
import {
  selectHasLoadedTextureFile,
  selectModelIndex,
  useAppDispatch,
  useAppSelector
} from '@/store';
import { showError } from '@/store/errorMessages';

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

/**
 * Downloads a scene as a GLTF file;
 * This was somewhat hacky, due to a request from a very niche
 * use-case of porting to MVC3 -- not original/main feature of
 * this app - hence literally rendering the scene and then output it to a GLTF.
 * R3F has a convenient export function once we've rendered so it didn't
 * make sense not to agree to this request.
 *
 * @param allModels whether we are exporting all models
 * @returns
 */
export default function useSceneGLTFFileDownloader(allModels: boolean) {
  const dispatch = useAppDispatch();
  const {
    renderAllModels,
    setRenderAllModels,
    meshDisplayMode,
    setMeshDisplayMode
  } = useContext(ViewOptionsContext);
  const { scene } = useSceneContext();
  const modelIndex = useAppSelector(selectModelIndex);
  const hasLoadedTextureFile = useAppSelector(selectHasLoadedTextureFile);
  const polygonFileName =
    useAppSelector((s) => s.modelData.polygonFileName) || '';

  const onDownloadSceneFile = useCallback(async () => {
    const prevMeshDisplayMode = meshDisplayMode;
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

    setMeshDisplayMode('textured');
    if (allModels) {
      setRenderAllModels(true);
    }
    await new Promise((r) => setTimeout(r, 100));

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

    const name = `${polygonFileName.substring(
      0,
      polygonFileName.lastIndexOf('.')
    )}${allModels ? '' : `-${modelIndex}`}`;

    saveAs(file, `${name}.mn.gltf`);

    await new Promise((r) => setTimeout(r, 100));
    setRenderAllModels(false);
    setMeshDisplayMode(prevMeshDisplayMode);
  }, [
    scene,
    allModels,
    renderAllModels,
    setRenderAllModels,
    meshDisplayMode,
    setMeshDisplayMode
  ]);

  return onDownloadSceneFile;
}
