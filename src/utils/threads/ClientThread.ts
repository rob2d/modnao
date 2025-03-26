import WorkerThreadPool from './WorkerThreadPool';
import { WorkerEvent } from '@/workers/worker';

const workerPool = new WorkerThreadPool();

/**
 * abstracts client threads on a pool so that we won't need to first
 * attempt an allocation before determining behavior, and also
 * can unallocate directly from class instance ref vs pool.
 *
 * In Next.js/SSR environments, we cannot guarantee we're in a worker-friendly
 * environment, so between pool + these behaviors, eliminates a lot of boilerplate.
 */
export default class ClientThread {
  thread?: Worker;

  constructor() {
    this.thread = workerPool.allocate();
  }

  set onmessage(onmessage: typeof Worker.prototype.onmessage) {
    if (this.thread) {
      this.thread.onmessage = onmessage;
    }
  }

  postMessage(
    message: unknown
  ): ReturnType<typeof Worker.prototype.postMessage> {
    return this.thread?.postMessage(message);
  }

  unallocate() {
    if (this.thread) {
      workerPool.unallocate(this.thread);
    }
    this.thread = undefined;
  }

  /**
   * static method to run a task on a thread without explicitly creating an instance.
   * Allocates a thread from the pool, runs the task, and releases the thread.
   *
   * @param type The type of the worker event.
   * @param payload The payload to send to the worker.
   * @returns A Promise that resolves with the worker's result.
   */
  static async run<TPayload, TResult>(
    type: string,
    payload: TPayload
  ): Promise<TResult> {
    const thread = new ClientThread();

    return new Promise<TResult>((resolve, reject) => {
      if (!thread.thread) {
        reject(new Error('Failed to allocate a worker thread.'));
        return;
      }

      thread.onmessage = (event: MessageEvent<{ result: TResult }>) => {
        resolve(event.data.result);
        thread.unallocate();
      };

      thread.thread.onerror = (error) => {
        reject(error);
        thread.unallocate();
      };

      thread.postMessage({
        type,
        payload
      } as WorkerEvent);
    });
  }
}
