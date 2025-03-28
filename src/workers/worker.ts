import adjustTextureHslWorker, {
  AdjustTextureHslWorkerPayload
} from './adjustTextureHslWorker';
import loadTextureFileWorker, {
  LoadTextureFileWorkerPayload
} from './loadTextureFileWorker';
import loadPolygonFileWorker, {
  LoadPolygonFileWorkerPayload
} from './loadPolygonFileWorker';
import { ExportTextureFilePayload } from '@/store';

export type WorkerEvent =
  | {
      type: 'loadPolygonFile';
      payload: LoadPolygonFileWorkerPayload;
    }
  | {
      type: 'loadTextureFile';
      payload: LoadTextureFileWorkerPayload;
    }
  | {
      type: 'adjustTextureHsl';
      payload: AdjustTextureHslWorkerPayload;
    }
  | {
      type: 'exportTextureFile';
      payload: ExportTextureFilePayload;
    };

addEventListener('message', async ({ data }: MessageEvent<WorkerEvent>) => {
  const { type, payload } = data;
  switch (type) {
    case 'loadPolygonFile': {
      const result = await loadPolygonFileWorker(payload);
      postMessage({ type: 'loadPolygonFile', result });
      break;
    }
    case 'loadTextureFile': {
      const result = await loadTextureFileWorker(payload);
      postMessage({ type: 'loadTextureFile', result });
      break;
    }
    case 'adjustTextureHsl': {
      const result = await adjustTextureHslWorker(payload);
      postMessage({ type: 'adjustTextureHsl', result });
      break;
    }
    default: {
      break;
    }
  }
});
