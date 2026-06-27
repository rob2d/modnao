import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import renderTestWithProviders from '@/utils/tests/renderTestWithProviders';
import SceneVertexModeControls from './SceneVertexModeControls';

describe('SceneVertexModeControls', () => {
  it('renders move-camera and vertex-selection controls', () => {
    renderTestWithProviders(
      <SceneVertexModeControls value='select' onChange={jest.fn()} />
    );

    expect(screen.getByRole('button', { name: 'Move camera' })).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Draw vertex selection area' })
    ).toBeVisible();
  });

  it('changes modes only when a different control is selected', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    renderTestWithProviders(
      <SceneVertexModeControls value='select' onChange={onChange} />
    );

    await user.click(
      screen.getByRole('button', { name: 'Draw vertex selection area' })
    );
    expect(onChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Move camera' }));
    expect(onChange).toHaveBeenCalledWith('camera');
  });
});
