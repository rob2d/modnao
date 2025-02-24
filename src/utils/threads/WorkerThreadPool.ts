/**
 * allocates worker threads on demand; reuses them when possible.
 *
 * Because we allocate blobs that we need access to use and revoke
 * on the main thread, a worker can never be actually-terminated. Hence
 * we use pooling to solve this issue.
 */
export default class WorkerThreadPool {
  activeThreads: Set<Worker> = new Set();
  unusedThreads: Worker[] = [];

  allocate: () => Worker | undefined = () => {
    if (!globalThis.Worker) {
      return undefined;
    }

    if (!this.unusedThreads.length) {
      const worker = new Worker(
        new URL('../../workers/worker.ts', import.meta.url),
        {
          type: 'module'
        }
      );
      this.activeThreads.add(worker);
      return worker;
    } else {
      return this.unusedThreads.pop() as Worker;
    }
  };

  unallocate = (worker: Worker) => {
    worker.onmessage = null;
    if (this.activeThreads.has(worker)) {
      this.activeThreads.delete(worker);
    }

    this.unusedThreads.push(worker);
  };
}
