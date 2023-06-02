import { useSceneContext } from '@/contexts/SceneContext';
import { useAppSelector } from '@/store';
import { useCallback } from 'react';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';

const exporter = new OBJExporter();

export default function useSceneOBJFileDownloader() {
  const { scene } = useSceneContext();
  const polygonFileName =
    useAppSelector((s) => s.modelData.polygonFileName) || '';

  const onDownloadSceneOBJFile = useCallback(() => {
    if (!scene) {
      throw new Error('no scene instantiated to get OBJ file');
    }

    const output = exporter.parse(scene);

    const file = new Blob([output], { type: 'application/object' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(file);
    const name = polygonFileName.substring(0, polygonFileName.lastIndexOf('.'));
    link.download = `${name}.modnao.obj`;
    link.click();
  }, [scene]);

  return onDownloadSceneOBJFile;
}
