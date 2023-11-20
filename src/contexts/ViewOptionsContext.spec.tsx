import { render, screen } from '@testing-library/react';
import ViewOptionsContext, {
  defaultValues,
  ViewOptions,
  ViewOptionsContextProvider
} from './ViewOptionsContext';
import { useContext } from 'react';
import { StorageKeys } from '@/constants/StorageKeys';

const viewOptionsKeys = Object.keys(defaultValues) as (keyof ViewOptions)[];
const getOptionRenderKeys = (viewOptions: ViewOptions) =>
  viewOptionsKeys.filter((k) => typeof viewOptions[k] !== 'function');

function TestOptionsContext() {
  const viewOptions: ViewOptions = useContext(ViewOptionsContext);

  return (
    <>
      {getOptionRenderKeys(viewOptions).map((k) => (
        <p key={k}>{`${k}: ${viewOptions[k]}`}</p>
      ))}
    </>
  );
}

describe('ViewOptionsContext', () => {
  it('has all values initialized properly', () => {
    render(
      <ViewOptionsContextProvider>
        <TestOptionsContext />
      </ViewOptionsContextProvider>
    );

    const displayedDefaults = getOptionRenderKeys(defaultValues).map(
      (k) => `${k}: ${defaultValues[k]}`
    );

    displayedDefaults.forEach((d) =>
      expect(screen.getByText(d)).toBeInTheDocument()
    );
  });

  it('has relevant values in localStorage set when initialized', () => {
    window.localStorage.setItem(StorageKeys.MESH_DISPLAY_MODE, 'textured');
    window.localStorage.setItem(StorageKeys.WIREFRAME_LINE_WIDTH, '5');
    window.localStorage.setItem(StorageKeys.AXES_HELPER_VISIBLE, 'false');
    window.localStorage.setItem(StorageKeys.OBJECT_ADDRESSES_VISIBLE, 'true');
    window.localStorage.setItem(StorageKeys.THEME_KEY, 'dark');
    window.localStorage.setItem(StorageKeys.DISABLE_BACKFACE_CULLING, 'true');
    window.localStorage.setItem(StorageKeys.UV_REGIONS_HIGHLIGHTED, 'false');
    window.localStorage.setItem(StorageKeys.DEV_OPTIONS_VISIBLE, 'true');
    window.localStorage.setItem(StorageKeys.ENABLE_VERTEX_COLORS, 'false');

    render(
      <ViewOptionsContextProvider>
        <TestOptionsContext />
      </ViewOptionsContextProvider>
    );

    const displayedValues = [
      'meshDisplayMode: textured',
      'wireframeLineWidth: 5',
      'axesHelperVisible: false',
      'objectAddressesVisible: true',
      'themeKey: dark',
      'disableBackfaceCulling: true',
      'uvRegionsHighlighted: false',
      'devOptionsVisible: true',
      'enableVertexColors: false'
    ];

    displayedValues.forEach((d) =>
      expect(screen.getByText(d)).toBeInTheDocument()
    );
  });
});
