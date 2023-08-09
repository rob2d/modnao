import { store } from './store';
import {
  adjustTextureHslFromThread,
  loadPolygonsFromWorker,
  LoadPolygonsPayload,
  loadTexturesFromWorker,
  LoadTexturesPayload
} from './modelDataSlice';
import HslValues from '@/utils/textures/HslValues';

export type WorkerResponses =
  | {
      type: 'loadPolygonFile';
      result: LoadPolygonsPayload;
    }
  | {
      type: 'loadTextureFile';
      result: LoadTexturesPayload;
    }
  | {
      type: 'adjustTextureHsl';
      result: {
        textureIndex: number;
        hsl: HslValues;
        bufferUrls: { translucent: string; opaque: string };
      };
    };

const worker: Worker | undefined = !globalThis.Worker
  ? undefined
  : new Worker(new URL('../worker.ts', import.meta.url), {
      type: 'module'
    });

if (worker) {
  worker.onmessage = async (event: MessageEvent<WorkerResponses>) => {
    switch (event.data.type) {
      case 'loadPolygonFile': {
        const { result } = event.data;
        console.log('result ->', result);
        store.dispatch(loadPolygonsFromWorker(result));
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
}

console.log('worker ->', worker);

export default worker;
