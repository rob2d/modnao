import { screen } from '@testing-library/react';
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
