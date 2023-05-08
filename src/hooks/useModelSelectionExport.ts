import { useCallback, useMemo } from 'react';
import exportFromJSON from 'export-from-json';
import { selectModel, selectModelIndex, selectObjectIndex } from '@/store';
import { useSelector } from 'react-redux';

export default function useModelSelectionExport() {
  const model = useSelector(selectModel);
  const modelIndex = useSelector(selectModelIndex);
  const objectIndex = useSelector(selectObjectIndex);

  const data = useMemo(() => {
    if (!model) {
      return {};
    }
    if (objectIndex === -1) {
      return model;
    }

    return model.meshes[objectIndex];
  }, [model, objectIndex]);

  const onDownloadModelSelection = useCallback(() => {
    exportFromJSON({
      data,
      fileName: `model-${modelIndex}-${objectIndex}`,
      exportType: exportFromJSON.types.json
    });
  }, [data]);

  return onDownloadModelSelection;
}
