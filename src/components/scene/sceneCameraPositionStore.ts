import { signal } from '@preact-signals/safe-react';

export interface SceneCameraPosition {
  position: [number, number, number];
  target: [number, number, number];
}

export const $sceneCameraPositions = signal(
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
  !key ? undefined : $sceneCameraPositions.value.get(key);

export const deleteSceneCameraPosition = (key: string | undefined) => {
  if (!key) {
    return;
  }

  const nextSceneCameraPositions = new Map($sceneCameraPositions.value);
  nextSceneCameraPositions.delete(key);
  $sceneCameraPositions.value = nextSceneCameraPositions;
};

export const setSceneCameraPosition = (
  key: string | undefined,
  cameraPosition: SceneCameraPosition
) => {
  if (!key) {
    return;
  }

  $sceneCameraPositions.value = new Map($sceneCameraPositions.value).set(
    key,
    cameraPosition
  );
};
