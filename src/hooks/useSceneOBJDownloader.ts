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

    // @TODO: when original filename is available,
    // format as STG{NN}.modnao.OBJ
    const file = new File([output], 'STG.modnao.obj', {
      type: 'application/object',
      lastModified: Date.now()
    });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(file);
    link.click();
  }, []);

  return onDownloadSceneOBJFile;
}
