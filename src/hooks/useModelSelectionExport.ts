import { useCallback, useMemo } from 'react';
import exportFromJSON from 'export-from-json';
import {
  selectModel,
  selectModelIndex,
  selectObjectKey,
  selectObjectSelectionType,
  useAppSelector
} from '@/store';

export default function useModelSelectionExport() {
  const model = useAppSelector(selectModel);
  const modelIndex = useAppSelector(selectModelIndex);
  const objectKey = useAppSelector(selectObjectKey);
  const objectType = useAppSelector(selectObjectSelectionType);

  const data = useMemo(() => {
    if (!model) {
      return {};
    }
    if (objectKey === undefined) {
      return model;
    }

    if (objectType === 'mesh') {
      return model.meshes[Number(objectKey)];
    }

    // type === 'polygon'
    const [meshKey, polygonKey] = objectKey.split('-').map(Number) as [
      number,
      number
    ];

    return model.meshes[meshKey]?.polygons[polygonKey];
  }, [model, objectKey, objectType]);

  const onDownloadModelSelection = useCallback(() => {
    if (modelIndex === -1) {
      return;
    }
    const hasSelection = objectKey !== undefined;
    exportFromJSON({
      data,
      fileName: `model-${modelIndex}${!hasSelection ? '' : `-${objectKey}`}`,
      exportType: exportFromJSON.types.json
    });
  }, [modelIndex, objectKey, data]);

  return onDownloadModelSelection;
}
