import {
  $meshSelectionType,
  $model,
  $modelIndex,
  $objectKey
} from '@/selectors';
import exportFromJSON from 'export-from-json';
import { useCallback, useMemo } from 'react';

export default function useModelSelectionExport() {
  'use no memo';

  const model = $model.value;
  const modelIndex = $modelIndex.value;
  const objectKey = $objectKey.value;
  const objectType = $meshSelectionType.value;

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
    const [meshKey, polygonKey] = objectKey.split('_').map(Number) as [
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
