import { useCallback, useMemo } from 'react';
import exportFromJSON from 'export-from-json';
import { selectModel, selectModelIndex, selectObjectKey } from '@/store';
import { useSelector } from 'react-redux';

export default function useModelSelectionExport() {
  const model = useSelector(selectModel);
  const modelIndex = useSelector(selectModelIndex);
  const objectKey = useSelector(selectObjectKey);

  const data = useMemo(() => {
    if (!model) {
      return {};
    }
    if (objectKey === -1) {
      return model;
    }

    return model.meshes[objectKey];
  }, [model, objectKey]);

  const onDownloadModelSelection = useCallback(() => {
    if (modelIndex === -1) {
      return;
    }
    const hasSelection = objectKey !== -1;
    exportFromJSON({
      data,
      fileName: `model-${modelIndex}${!hasSelection ? '' : `-${objectKey}`}`,
      exportType: exportFromJSON.types.json
    });
  }, [modelIndex, objectKey, data]);

  return onDownloadModelSelection;
}
