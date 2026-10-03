import {
  $meshSelectionType,
  $modelIndex
} from '@/modules/object-viewer/objectViewerStore';
import { $model, $objectKey } from '@/derivedState';
import { useValue } from '@legendapp/state/react';
import exportFromJSON from 'export-from-json';
import { useCallback, useMemo } from 'react';

export default function useModelSelectionExport() {
  const model = useValue($model);
  const modelIndex = useValue($modelIndex);
  const objectKey = useValue($objectKey);
  const objectType = useValue($meshSelectionType);

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
