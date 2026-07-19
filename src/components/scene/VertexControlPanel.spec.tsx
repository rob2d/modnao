import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SceneOptionsContextProvider } from '@/contexts/SceneOptionsContext';
import VertexControlPanel, {
  getDefaultGradientVertexColors
} from './VertexControlPanel';
import type { VertexColorUpdate } from '@/modules/model-data';
import renderTestWithProviders from '@/utils/tests/renderTestWithProviders';

const vertexColorUpdate: VertexColorUpdate = {
  contentAddress: 1,
  color: [255, 255, 255, 255]
};

describe('VertexControlPanel', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows an empty state when selected vertices are not editable', () => {
    renderTestWithProviders(
      <VertexControlPanel selectedVertexColors={[]} selectedVertexCount={1} />
    );

    expect(
      screen.getByText('No vertices with editable colors in selection.')
    ).toBeVisible();
    expect(
      screen.queryByRole('group', { name: 'Vertex color edit mode' })
    ).not.toBeInTheDocument();
  });

  it('shows a partial-editability notice when some selected vertices are editable', () => {
    renderTestWithProviders(
      <VertexControlPanel
        selectedVertexColors={[vertexColorUpdate]}
        selectedVertexCount={2}
      />
    );

    const lightnessSlider = screen.getByRole('slider', { name: 'L' });
    const partialEditabilityNotice = screen.getByText(
      'Some vertices selected do not have editable colors'
    );

    expect(partialEditabilityNotice).toBeVisible();
    expect(
      lightnessSlider.compareDocumentPosition(partialEditabilityNotice) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      screen.getByRole('group', { name: 'Vertex color edit mode' })
    ).toBeVisible();
  });

  it('persists the selected vertex color edit mode', async () => {
    const user = userEvent.setup();
    const panel = (
      <SceneOptionsContextProvider>
        <VertexControlPanel
          selectedVertexColors={[vertexColorUpdate]}
          selectedVertexCount={1}
        />
      </SceneOptionsContextProvider>
    );

    const { renderResult } = renderTestWithProviders(panel);

    await user.click(screen.getByRole('button', { name: 'Gradient' }));
    expect(screen.getByRole('slider', { name: 'Angle' })).toBeVisible();

    renderResult.unmount();
    renderTestWithProviders(panel);

    expect(screen.getByRole('slider', { name: 'Angle' })).toBeVisible();
  });

  it('does not edit colors when the vertex selection changes before interaction', () => {
    jest.useFakeTimers();
    localStorage.setItem('vertexColorEditMode', 'gradientSelection');
    const panel = (selectedVertexColors: VertexColorUpdate[]) => (
      <SceneOptionsContextProvider>
        <VertexControlPanel
          selectedVertexColors={selectedVertexColors}
          selectedVertexCount={selectedVertexColors.length}
        />
      </SceneOptionsContextProvider>
    );
    const { renderResult, store } = renderTestWithProviders(
      panel([vertexColorUpdate])
    );
    const dispatchSpy = jest.spyOn(store!, 'dispatch');

    renderResult.rerender(
      panel([
        {
          contentAddress: 2,
          color: [1, 0, 0, 1]
        }
      ])
    );

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('defaults gradient handles to the same color when the selection has one color', () => {
    const defaultGradientVertexColors = getDefaultGradientVertexColors([
      { contentAddress: 1, color: [1, 0, 0, 1] },
      { contentAddress: 2, color: [1, 0, 0, 1] }
    ]);

    expect(defaultGradientVertexColors).toEqual({
      startColor: { r: 255, g: 0, b: 0 },
      endColor: { r: 255, g: 0, b: 0 }
    });
  });

  it('defaults gradient handles to the selected colors with the widest color range', () => {
    const defaultGradientVertexColors = getDefaultGradientVertexColors([
      { contentAddress: 1, color: [1, 0, 0, 1] },
      { contentAddress: 2, color: [1, 0.45, 0, 1] },
      { contentAddress: 3, color: [0, 0.15, 1, 1] }
    ]);

    expect(defaultGradientVertexColors).toEqual({
      startColor: { r: 255, g: 0, b: 0 },
      endColor: { r: 0, g: 38, b: 255 }
    });
  });
});
