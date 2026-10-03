import { resetModelData } from '@/modules/model-data/modelDataStore';
import { resetObjectViewer } from '@/modules/object-viewer/objectViewerStore';
import { getState, resetState } from '@/store';
import { render, waitFor } from '@testing-library/react';
import { useEffect } from 'react';
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
    resetState();
    resetModelData();
    resetObjectViewer();
    const { rerender, unmount } = render(
      <>
        <ModNaoBrowserApiProvider>
          <TestCapabilities enabled={false} />
        </ModNaoBrowserApiProvider>
      </>
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

    expect(getState().errorMessages.messages).toHaveLength(1);

    rerender(
      <>
        <ModNaoBrowserApiProvider>
          <TestCapabilities enabled />
        </ModNaoBrowserApiProvider>
      </>
    );

    expect(window.modNao).toBe(browserApi);
    expect(browserApi.camera).toBe(camera);
    expect(browserApi.scene).toBe(scene);

    rerender(
      <>
        <ModNaoBrowserApiProvider>
          <TestCapabilities enabled={false} />
        </ModNaoBrowserApiProvider>
      </>
    );

    expect(window.modNao).toBe(browserApi);
    expect(browserApi.camera).toBeUndefined();
    expect(browserApi.scene).toBeUndefined();

    unmount();

    expect(window.modNao).toBeUndefined();
  });
});
