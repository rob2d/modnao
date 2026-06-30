import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rootReducer } from '@/store';
import renderTestWithProviders from '@/utils/tests/renderTestWithProviders';
import SceneVertexModeControls from './SceneVertexModeControls';

const createVertex = (index: number): NLVertex => ({
  address: index,
  addressingMode: 'direct',
  contentAddress: index,
  contentModeValue: 0,
  index,
  normals: [0, 0, 1],
  position: [0, 0, 0],
  uv: [0, 0],
  vertexOffset: 0
});

const selectableVertexModel: NLModel = {
  address: 0,
  mainBounds: {
    center: [0, 0, 0],
    max: [0, 0, 0],
    min: [0, 0, 0],
    size: [0, 0, 0],
    totalVertexCount: 2,
    vertexCount: 2
  },
  meshes: [
    {
      address: 0,
      alpha: 1,
      baseParams: 0,
      color: [0, 0, 0],
      hasColoredVertices: false,
      isOpaque: true,
      polygonDataLength: 0,
      polygons: [
        {
          actualVertexCount: 2,
          address: 0,
          flags: {
            culling: false,
            cullingType: 'front',
            envMaps: false,
            gouradShading: false,
            reuseGlobalParams: false,
            spriteQuad: false,
            strip: false,
            superVertexIndex: false,
            triangles: true
          },
          indices: [],
          triIndices: [],
          vertexCount: 2,
          vertexGroupMode: 'regular',
          vertexGroupModeValue: 0,
          vertices: [createVertex(0), createVertex(1)]
        }
      ],
      position: [0, 0, 0],
      specularAlpha: 1,
      specularColor: [0, 0, 0],
      textureColorFormat: 'ARGB8888',
      textureColorFormatValue: 0,
      textureControlValue: 0,
      textureIndex: 0,
      textureInstructions: 0,
      textureSize: [8, 8],
      textureSizeValue: 0,
      textureWrappingFlags: {
        hFlip: false,
        hRepeat: false,
        hStretch: false,
        vFlip: false,
        vRepeat: false
      },
      textureWrappingValue: 0,
      vertexColorModeValue: 0
    }
  ],
  position: [0, 0, 0],
  radius: 0,
  ramAddress: 0,
  totalVertexCount: 2
};

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

  it('renders vertex selection actions when vertices are selectable', async () => {
    const user = userEvent.setup();
    const initialAppState = rootReducer(undefined, { type: 'test/init' });

    const { store } = renderTestWithProviders(
      <SceneVertexModeControls value='select' onChange={jest.fn()} />,
      {
        preloadedState: {
          ...initialAppState,
          objectViewer: {
            ...initialAppState.objectViewer,
            modelIndex: 0,
            selectedIds: { '0_0_0': true },
            meshSelectionType: 'vertex'
          },
          modelData: {
            ...initialAppState.modelData,
            models: [selectableVertexModel]
          }
        }
      }
    );

    await user.click(
      screen.getByRole('button', { name: 'Select all vertices' })
    );
    expect(store?.getState().objectViewer.selectedIds).toEqual({
      '0_0_0': true,
      '0_0_1': true
    });

    await user.click(
      screen.getByRole('button', { name: 'Clear vertex selection' })
    );

    expect(store?.getState().objectViewer.selectedIds).toEqual({});
  });
});
