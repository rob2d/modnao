import BufferStorage from './BufferStorage';

/**
 * singleton instance to manage buffers
 * in UI thread
 */
const globalBuffers = new BufferStorage();
export default globalBuffers;
