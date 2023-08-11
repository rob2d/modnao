import {
  AdjustTextureHslPayload,
  LoadPolygonsPayload,
  LoadTexturesPayload
} from './modelDataSlice';

export type LoadPolygonsResult = {
  type: 'loadPolygonFile';
  result: LoadPolygonsPayload;
};

export type LoadTexturesResult = {
  type: 'loadTextureFile';
  result: LoadTexturesPayload;
};

export type AdjustTextureHslResult = {
  type: 'adjustTextureHsl';
  result: AdjustTextureHslPayload;
};

export type WorkerResponses =
  | LoadPolygonsResult
  | LoadTexturesResult
  | AdjustTextureHslResult;

export const createWorkerThread = () =>
  !globalThis.Worker
    ? undefined
    : new Worker(new URL('../worker.ts', import.meta.url), {
        type: 'module'
      });
