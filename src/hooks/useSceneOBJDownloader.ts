import { useSceneContext } from '@/contexts/SceneContext';
import { useCallback } from 'react';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';

const exporter = new OBJExporter();

export default function useSceneOBJFileDownloader() {
  const { scene } = useSceneContext();

  const onDownloadSceneOBJFile = useCallback(() => {
    if (!scene) {
      throw new Error('no scene instantiated to get OBJ file');
    }

    const output = exporter.parse(scene);

    const file = new Blob([output], { type: 'application/object' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(file);
    link.click();

    link.download = 'STG00.modnao.obj';
  }, [scene]);

  return onDownloadSceneOBJFile;
}
