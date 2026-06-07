import React, { useContext } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useKeyPress } from '@react-typed-hooks/use-key-press';
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
  const { enableCinematicMode } = useContext(SceneOptionsContext);

  useObjectNavControls();

  return <p>{`enableCinematicMode: ${enableCinematicMode}`}</p>;
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

  it('toggles cinematic mode with ctrl and backslash', async () => {
    const view = renderTestHarness();

    expect(screen.getByText('enableCinematicMode: false')).toBeInTheDocument();

    pressedKeys.add('Control');
    pressedKeys.add('\\');
    view.rerender(
      <SceneOptionsContextProvider>
        <TestHarness />
      </SceneOptionsContextProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('enableCinematicMode: true')).toBeInTheDocument();
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
      expect(
        screen.getByText('enableCinematicMode: false')
      ).toBeInTheDocument();
    });
  });
});
