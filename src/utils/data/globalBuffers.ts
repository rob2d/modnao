import BufferStorage from './BufferStorage';

/**
 * singleton instance to manage buffers
 * in UI thread
 */
const globalBuffers = new BufferStorage();
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  Object.assign(window, { globalBuffers });
}
export default globalBuffers;
