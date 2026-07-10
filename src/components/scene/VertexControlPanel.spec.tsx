import { render, screen } from '@testing-library/react';
import VertexControlPanel from './VertexControlPanel';
import type { VertexColorUpdate } from '@/modules/model-data';

const vertexColorUpdate: VertexColorUpdate = {
  contentAddress: 1,
  color: [255, 255, 255, 255]
};

describe('VertexControlPanel', () => {
  it('shows an empty state when selected vertices are not editable', () => {
    render(
      <VertexControlPanel
        selectedVertexColors={[]}
        selectedVertexCount={1}
        onAdjustHsl={jest.fn()}
        onApplyGradient={jest.fn()}
        onPickColor={jest.fn()}
      />
    );

    expect(
      screen.getByText('No vertices with editable colors in selection.')
    ).toBeVisible();
    expect(
      screen.queryByRole('group', { name: 'Vertex color edit mode' })
    ).not.toBeInTheDocument();
  });

  it('shows a partial-editability notice when some selected vertices are editable', () => {
    render(
      <VertexControlPanel
        selectedVertexColors={[vertexColorUpdate]}
        selectedVertexCount={2}
        onAdjustHsl={jest.fn()}
        onApplyGradient={jest.fn()}
        onPickColor={jest.fn()}
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
});
