import { nanoid } from 'nanoid';
/**
 * manages SharedArrayBuffer storage using keys
 * so they can be accessed from either the main
 * thread or a worker thread without boilerplate
 */
export default class BufferStorage {
  #storage: Map<string, SharedArrayBuffer>;

  constructor() {
    this.#storage = new Map<string, SharedArrayBuffer>();
  }

  add(buffer: Uint8Array | SharedArrayBuffer): string {
    let sharedBuffer: SharedArrayBuffer;

    if (buffer instanceof SharedArrayBuffer) {
      sharedBuffer = buffer;
    } else {
      sharedBuffer = new SharedArrayBuffer(buffer.length);
      const sharedArray = new Uint8Array(sharedBuffer);
      sharedArray.set(buffer);
    }

    // Generate a unique key and store the buffer
    const key = nanoid();
    this.#storage.set(key, sharedBuffer);
    return key;
  }

  delete(key: string): boolean {
    return this.#storage.delete(key);
  }
  get(key: string): Uint8Array {
    const buffer = this.#storage.get(key);
    if (!buffer) {
      console.error(`failed to get buffer @ ${key}`);
      return new Uint8Array(0);
    }

    const bufferView = new Uint8Array(buffer);
    return bufferView;
  }
  getShared(key: string): SharedArrayBuffer {
    const buffer = this.#storage.get(key);

    if (!buffer) {
      console.error(`failed to get buffer @ ${key}`);
      return new SharedArrayBuffer(0);
    }
    return buffer;
  }
  get size(): number {
    return (() => this.#storage.size)();
  }

  clear() {
    this.#storage.clear();
  }
}
