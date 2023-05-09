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
    if (modelIndex === -1) {
      return;
    }
    const hasSelection = objectIndex !== -1;
    exportFromJSON({
      data,
      fileName: `model-${modelIndex}${!hasSelection ? '' : `-${objectIndex}`}`,
      exportType: exportFromJSON.types.json
    });
  }, [modelIndex, objectIndex, data]);

  return onDownloadModelSelection;
}
