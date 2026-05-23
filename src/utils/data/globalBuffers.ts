import BufferStorage from './BufferStorage';

/**
 * singleton instance to manage buffers
 * in UI thread
 */
const globalBuffers = new BufferStorage();
const debugWindow =
  process.env.NODE_ENV === 'development' ? globalThis.window : undefined;

if (debugWindow) {
  Object.assign(debugWindow, { globalBuffers });
}
export default globalBuffers;
