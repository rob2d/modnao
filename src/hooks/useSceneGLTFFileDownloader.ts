import { useSceneContext } from '@/contexts/SceneContext';
import { useAppSelector } from '@/store';
import { useCallback } from 'react';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

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

export default function useSceneGLTFFileDownloader() {
  const { scene } = useSceneContext();
  const polygonFileName =
    useAppSelector((s) => s.modelData.polygonFileName) || '';

  const onDownloadSceneFile = useCallback(async () => {
    if (!scene) {
      throw new Error('no scene instantiated to get GLTF file');
    }

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
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(file);
    const name = polygonFileName.substring(0, polygonFileName.lastIndexOf('.'));
    link.download = `${name}.mn.gltf`;
    link.click();
  }, [scene]);

  return onDownloadSceneFile;
}
