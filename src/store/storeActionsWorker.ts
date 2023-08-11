import { store } from './store';
import {
  AdjustTextureHslPayload,
  LoadPolygonsPayload,
  loadTexturesFromWorker,
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

export const createWorker = () =>
  !globalThis.Worker
    ? undefined
    : new Worker(new URL('../worker.ts', import.meta.url), {
        type: 'module'
      });

export const workerMessageHandler = async (
  event: MessageEvent<WorkerResponses>
) => {
  switch (event.data.type) {
    case 'adjustTextureHsl':
    case 'loadPolygonFile': {
      break;
    }
    case 'loadTextureFile': {
      const { result } = event.data;
      store.dispatch(loadTexturesFromWorker(result));
      break;
    }
  }
};

const worker = createWorker();
if (worker) {
  worker.onmessage = workerMessageHandler;
}

export default worker;
