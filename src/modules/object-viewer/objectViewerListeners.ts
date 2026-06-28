import { createListenerMiddleware } from '@reduxjs/toolkit';
import type { ModelDataState } from '@/modules/model-data';
import {
  type MeshSelectionType,
  type ObjectViewerState,
  setObjectKeys,
  setObjectType
} from './objectViewerSlice';

interface ObjectSelectionConversionState {
  modelData: ModelDataState;
  objectViewer: ObjectViewerState;
}

const objectViewerListenerMiddleware =
  createListenerMiddleware<ObjectSelectionConversionState>();

/** converts selected mesh keys to polygon or vertex keys. */
const getMeshSelectionConvertedKeys = (
  model: NLModel | undefined,
  selectedKeys: string[],
  nextType: MeshSelectionType
) => {
  if (!model || nextType === 'mesh') {
    return [];
  }

  return selectedKeys.flatMap((objectKey) => {
    const meshIndex = Number(objectKey);
    const mesh = model.meshes[meshIndex];

    if (!mesh) {
      return [];
    }

    if (nextType === 'polygon') {
      return mesh.polygons.map(
        (_, polygonIndex) => `${meshIndex}_${polygonIndex}`
      );
    }

    return mesh.polygons.flatMap((polygon, polygonIndex) =>
      polygon.vertices.map(
        (_, vertexIndex) => `${meshIndex}_${polygonIndex}_${vertexIndex}`
      )
    );
  });
};

/** converts selected polygon keys upon conversion to another type */
const getPolygonSelectionConvertedKeys = (
  model: NLModel | undefined,
  selectedKeys: string[],
  nextType: MeshSelectionType
) => {
  if (!model) {
    return [];
  }

  if (nextType === 'mesh') {
    const selectedPolygonIndexesByMesh = new Map<number, Set<number>>();

    selectedKeys.forEach((objectKey) => {
      const [meshIndexText, polygonIndexText] = objectKey.split('_');
      const meshIndex = Number(meshIndexText);
      const polygonIndex = Number(polygonIndexText);

      if (!model.meshes[meshIndex]?.polygons[polygonIndex]) {
        return;
      }

      const selectedPolygonIndexes =
        selectedPolygonIndexesByMesh.get(meshIndex) ?? new Set<number>();
      selectedPolygonIndexes.add(polygonIndex);
      selectedPolygonIndexesByMesh.set(meshIndex, selectedPolygonIndexes);
    });

    return Array.from(selectedPolygonIndexesByMesh.entries()).flatMap(
      ([meshIndex, selectedPolygonIndexes]) => {
        const mesh = model.meshes[meshIndex];

        if (mesh.polygons.length !== selectedPolygonIndexes.size) {
          return [];
        }

        return `${meshIndex}`;
      }
    );
  }

  if (nextType !== 'vertex') {
    // polygon selections only preserve partial intent when narrowing
    return [];
  }

  return selectedKeys.flatMap((objectKey) => {
    const [meshIndexText, polygonIndexText] = objectKey.split('_');
    const meshIndex = Number(meshIndexText);
    const polygonIndex = Number(polygonIndexText);
    const polygon = model.meshes[meshIndex]?.polygons[polygonIndex];

    if (!polygon) {
      // ignore stale keys that no longer resolve
      return [];
    }

    return polygon.vertices.map(
      (_, vertexIndex) => `${meshIndex}_${polygonIndex}_${vertexIndex}`
    );
  });
};

/** routes selection conversion by previous and next selection type. */
const getConvertedObjectKeys = (
  state: ObjectSelectionConversionState,
  selectedKeys: string[],
  previousType: MeshSelectionType,
  nextType: MeshSelectionType
) => {
  const model = state.modelData.models[state.objectViewer.modelIndex];

  if (previousType === 'mesh') {
    return getMeshSelectionConvertedKeys(model, selectedKeys, nextType);
  }

  if (previousType === 'polygon') {
    return getPolygonSelectionConvertedKeys(model, selectedKeys, nextType);
  }

  return [];
};

/** preserves compatible selections after setObjectType clears the reducer state. */
objectViewerListenerMiddleware.startListening({
  actionCreator: setObjectType,
  effect: (action, listenerApi) => {
    const previousState = listenerApi.getOriginalState();
    const previousType = previousState.objectViewer.meshSelectionType;
    const nextType = action.payload;

    if (previousType === nextType) {
      return;
    }

    const selectedKeys = Object.keys(previousState.objectViewer.selectedIds);

    if (!selectedKeys.length) {
      return;
    }

    const convertedObjectKeys = getConvertedObjectKeys(
      previousState,
      selectedKeys,
      previousType,
      nextType
    );

    if (!convertedObjectKeys.length) {
      return;
    }

    listenerApi.dispatch(setObjectKeys(convertedObjectKeys));
  }
});

export default objectViewerListenerMiddleware;
