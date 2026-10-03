import { observable } from '@legendapp/state';

export interface SceneCameraPosition {
  position: [number, number, number];
  target: [number, number, number];
}

export const $sceneCameraPositions = observable(
  new Map<string, SceneCameraPosition>()
);

export const getSceneCameraPositionKey = (
  polygonBufferKey: string | undefined,
  modelIndex: number
) =>
  !polygonBufferKey || modelIndex < 0
    ? undefined
    : `${polygonBufferKey}:${modelIndex}`;

export const getSceneCameraPosition = (key: string | undefined) =>
  !key ? undefined : $sceneCameraPositions.get().get(key);

export const deleteSceneCameraPosition = (key: string | undefined) => {
  if (!key) {
    return;
  }

  const nextSceneCameraPositions = new Map($sceneCameraPositions.get());
  nextSceneCameraPositions.delete(key);
  $sceneCameraPositions.set(nextSceneCameraPositions);
};

export const setSceneCameraPosition = (
  key: string | undefined,
  cameraPosition: SceneCameraPosition
) => {
  if (!key) {
    return;
  }

  $sceneCameraPositions.set(
    new Map($sceneCameraPositions.get()).set(key, cameraPosition)
  );
};
