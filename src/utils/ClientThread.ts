import WorkerThreadPool from '../utils/WorkerThreadPool';

const workerPool = new WorkerThreadPool();

/**
 * abstracts client threads on pool so that we won't need to first
 * attempt an allocation before determining behavior, and also
 * can unallocate directly from class instance ref vs pool
 *
 * In Next.js/ssr env, we cannot guarantee we're in a worker-friendly
 * environment, so between pool + these behaviors, eliminates a lot of boilerplate
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
    this.thread?.postMessage(message);
  }

  unallocate() {
    if (this.thread) {
      workerPool.unallocate(this.thread);
    }

    this.thread = undefined;
  }
}
