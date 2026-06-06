import React, { useContext } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useKeyPress } from '@react-typed-hooks/use-key-press';
import { StorageKeys } from '@/constants/StorageKeys';
import SceneOptionsContext, {
  SceneOptionsContextProvider
} from '@/contexts/SceneOptionsContext';
import useObjectNavControls from './useObjectNavControls';

jest.mock('@react-typed-hooks/use-key-press', () => ({
  useKeyPress: jest.fn()
}));

jest.mock('@/storeTypings', () => {
  const actualStoreTypings = jest.requireActual('@/storeTypings');

  return {
    ...actualStoreTypings,
    useAppDispatch: jest.fn(() => jest.fn())
  };
});

interface UseKeyPressParams {
  targetKey: string;
}

const pressedKeys = new Set<string>();
const mockUseKeyPress = jest.mocked(useKeyPress);

function TestHarness() {
  const { guiPanelExpansionLevel } = useContext(SceneOptionsContext);

  useObjectNavControls();

  return <p>{`guiPanelExpansionLevel: ${guiPanelExpansionLevel}`}</p>;
}

function renderTestHarness() {
  return render(
    <SceneOptionsContextProvider>
      <TestHarness />
    </SceneOptionsContextProvider>
  );
}

describe('useObjectNavControls', () => {
  beforeEach(() => {
    localStorage.clear();
    pressedKeys.clear();
    mockUseKeyPress.mockImplementation(({ targetKey }: UseKeyPressParams) =>
      pressedKeys.has(targetKey)
    );
  });

  afterEach(() => {
    mockUseKeyPress.mockReset();
  });

  it('toggles the gui panel visibility with ctrl and backslash', async () => {
    localStorage.setItem(StorageKeys.GUI_PANEL_EXPANSION_LEVEL, '2');

    const view = renderTestHarness();

    expect(screen.getByText('guiPanelExpansionLevel: 2')).toBeInTheDocument();

    pressedKeys.add('Control');
    pressedKeys.add('\\');
    view.rerender(
      <SceneOptionsContextProvider>
        <TestHarness />
      </SceneOptionsContextProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('guiPanelExpansionLevel: 0')).toBeInTheDocument();
    });

    pressedKeys.clear();
    view.rerender(
      <SceneOptionsContextProvider>
        <TestHarness />
      </SceneOptionsContextProvider>
    );

    pressedKeys.add('Control');
    pressedKeys.add('\\');
    view.rerender(
      <SceneOptionsContextProvider>
        <TestHarness />
      </SceneOptionsContextProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('guiPanelExpansionLevel: 2')).toBeInTheDocument();
    });
  });

  it('restores a collapsed gui panel to the minimum visible expansion level', async () => {
    localStorage.setItem(StorageKeys.GUI_PANEL_EXPANSION_LEVEL, '0');

    const view = renderTestHarness();

    expect(screen.getByText('guiPanelExpansionLevel: 0')).toBeInTheDocument();

    pressedKeys.add('Control');
    pressedKeys.add('\\');
    view.rerender(
      <SceneOptionsContextProvider>
        <TestHarness />
      </SceneOptionsContextProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('guiPanelExpansionLevel: 1')).toBeInTheDocument();
    });
  });
});
