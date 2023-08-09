import { store } from './store';
import {
  adjustTextureHslFromThread,
  LoadPolygonsPayload,
  loadTexturesFromWorker,
  LoadTexturesPayload
} from './modelDataSlice';
import HslValues from '@/utils/textures/HslValues';
export type LoadPolygonsResult = {
  type: 'loadPolygonFile';
  result: LoadPolygonsPayload;
};

export type LoadTexturesResult = {
  type: 'loadTextureFile';
  result: LoadTexturesPayload;
};

export type WorkerResponses =
  | LoadPolygonsResult
  | LoadTexturesResult
  | {
      type: 'adjustTextureHsl';
      result: {
        textureIndex: number;
        hsl: HslValues;
        bufferUrls: { translucent: string; opaque: string };
      };
    };

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
    case 'loadPolygonFile': {
      break;
    }
    case 'loadTextureFile': {
      const { result } = event.data;
      store.dispatch(loadTexturesFromWorker(result));
      break;
    }
    case 'adjustTextureHsl': {
      const { result } = event.data;
      store.dispatch(adjustTextureHslFromThread(result));
      break;
    }
  }
};

const worker = createWorker();
if (worker) {
  worker.onmessage = workerMessageHandler;
}

export default worker;
