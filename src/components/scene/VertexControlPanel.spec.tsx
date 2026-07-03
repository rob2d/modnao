import { render, screen } from '@testing-library/react';
import VertexControlPanel from './VertexControlPanel';

describe('VertexControlPanel', () => {
  it('shows an empty state when selected vertices are not editable', () => {
    render(
      <VertexControlPanel
        selectedVertexColors={[]}
        onAdjustHsl={jest.fn()}
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
});
