import { useEffect } from 'react';
import { render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { setupStore } from '@/store';
import {
  ModNaoBrowserApiProvider,
  useModNaoBrowserApiRegistration
} from './ModNaoBrowserApiContext';

const camera: ModNaoCameraApi = {
  position: [0, 0, 0],
  target: [0, 0, 0],
  moveTo: async () => undefined,
  orbitTo: async () => undefined
};

const scene: ModNaoSceneApi = {
  options: {} as ModNaoSceneApi['options']
};

function TestCapabilities({ enabled }: { enabled: boolean }) {
  const { registerCamera, registerScene } = useModNaoBrowserApiRegistration();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const unregisterCamera = registerCamera(camera);
    const unregisterScene = registerScene(scene);

    return () => {
      unregisterCamera();
      unregisterScene();
    };
  }, [enabled, registerCamera, registerScene]);

  return null;
}

describe('ModNaoBrowserApiProvider', () => {
  afterEach(() => {
    delete window.modNao;
  });

  it('owns one stable API object while capabilities change', async () => {
    const store = setupStore();
    const { rerender, unmount } = render(
      <Provider store={store}>
        <ModNaoBrowserApiProvider>
          <TestCapabilities enabled={false} />
        </ModNaoBrowserApiProvider>
      </Provider>
    );

    await waitFor(() => expect(window.modNao).toBeDefined());

    const browserApi = window.modNao as ModNaoBrowserApi;

    expect(Object.keys(browserApi)).toEqual([
      'camera',
      'files',
      'object',
      'scene'
    ]);
    expect(browserApi.files.load).toEqual(expect.any(Function));
    expect(browserApi.object.viewedIndex).toBe(-1);
    expect(browserApi.object.selectedIndexes).toEqual([]);
    expect(browserApi.camera).toBeUndefined();
    expect(browserApi.scene).toBeUndefined();

    await browserApi.files.load([new File([], 'stage.mnp.zip')]);

    expect(store.getState().errorMessages.messages).toHaveLength(1);

    rerender(
      <Provider store={store}>
        <ModNaoBrowserApiProvider>
          <TestCapabilities enabled />
        </ModNaoBrowserApiProvider>
      </Provider>
    );

    expect(window.modNao).toBe(browserApi);
    expect(browserApi.camera).toBe(camera);
    expect(browserApi.scene).toBe(scene);

    rerender(
      <Provider store={store}>
        <ModNaoBrowserApiProvider>
          <TestCapabilities enabled={false} />
        </ModNaoBrowserApiProvider>
      </Provider>
    );

    expect(window.modNao).toBe(browserApi);
    expect(browserApi.camera).toBeUndefined();
    expect(browserApi.scene).toBeUndefined();

    unmount();

    expect(window.modNao).toBeUndefined();
  });
});
