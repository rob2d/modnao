import { render, screen } from '@testing-library/react';
import ViewOptionsContext, {
  defaultValues,
  ViewOptions,
  ViewOptionsContextProvider
} from './ViewOptionsContext';
import { useContext } from 'react';
import { StorageKeys } from '@/constants/StorageKeys';
import userEvent from '@testing-library/user-event';
import React from 'react';

const viewOptionsKeys = Object.keys(defaultValues) as (keyof ViewOptions)[];
const getOptionRenderKeys = (viewOptions: ViewOptions) =>
  viewOptionsKeys.filter((k) => typeof viewOptions[k] !== 'function');

const booleanSetterKeys = [
  'setSceneCursorVisible',
  'setAxesHelperVisible',
  'setObjectAddressesVisible',
  'setGuiPanelVisible',
  'setDevOptionsVisible',
  'setUvRegionsHighlighted',
  'setDisableBackfaceCulling',
  'setEnableVertexColors'
] as const;

const booleanStorageKeys: Set<string> = new Set([
  StorageKeys.AXES_HELPER_VISIBLE,
  StorageKeys.OBJECT_ADDRESSES_VISIBLE,
  StorageKeys.DEV_OPTIONS_VISIBLE,
  StorageKeys.UV_REGIONS_HIGHLIGHTED,
  StorageKeys.DISABLE_BACKFACE_CULLING,
  StorageKeys.ENABLE_VERTEX_COLORS
]);

function TestOptionsContext() {
  const viewOptions: ViewOptions = useContext(ViewOptionsContext);

  return (
    <>
      {getOptionRenderKeys(viewOptions).map((k) => (
        <p key={k}>{`${k}: ${viewOptions[k]}`}</p>
      ))}
      {booleanSetterKeys.map((k) => (
        <React.Fragment key={k}>
          <button
            data-testid={`${k}-true`}
            key={`${k}-true`}
            onClick={() => viewOptions[k](true)}
          >{`setter(${k}, true)`}</button>
          <button
            data-testid={`${k}-false`}
            key={`${k}-false`}
            onClick={() => viewOptions[k](false)}
          >{`setter(${k}, false)`}</button>
        </React.Fragment>
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

  it('updates boolean values in localStorage & context value when setters are called', async () => {
    const trueSetterTestIds = booleanSetterKeys.map((k) => `${k}-true`);
    const falseSetterTestIds = booleanSetterKeys.map((k) => `${k}-false`);

    render(
      <ViewOptionsContextProvider>
        <TestOptionsContext />
      </ViewOptionsContextProvider>
    );

    for (const id of trueSetterTestIds) {
      const trueSetter = screen.getByTestId(id);
      userEvent.click(trueSetter);
    }

    let displayedValues = [
      'axesHelperVisible: true',
      'objectAddressesVisible: true',
      'disableBackfaceCulling: true',
      'uvRegionsHighlighted: true',
      'devOptionsVisible: true',
      'enableVertexColors: true'
    ];

    for (const v of displayedValues) {
      expect(await screen.findByText(v)).toBeInTheDocument();

      const key = v.split(':')[0];
      if (booleanStorageKeys.has(key)) {
        expect(window.localStorage.getItem(key)).toBe('true');
      }
    }

    for (const id of falseSetterTestIds) {
      const falseSetter = screen.getByTestId(id);
      userEvent.click(falseSetter);
    }

    displayedValues = [
      'axesHelperVisible: false',
      'objectAddressesVisible: false',
      'disableBackfaceCulling: false',
      'uvRegionsHighlighted: false',
      'devOptionsVisible: false',
      'enableVertexColors: false'
    ];

    for (const v of displayedValues) {
      expect(await screen.findByText(v)).toBeInTheDocument();

      const key = v.split(':')[0];
      if (booleanStorageKeys.has(key)) {
        expect(window.localStorage.getItem(key)).toBe('false');
      }
    }

    displayedValues = [
      'axesHelperVisible: true',
      'objectAddressesVisible: true',
      'disableBackfaceCulling: true',
      'uvRegionsHighlighted: true',
      'devOptionsVisible: true',
      'enableVertexColors: true'
    ];

    for (const id of trueSetterTestIds) {
      const trueSetter = screen.getByTestId(id);
      userEvent.click(trueSetter);
    }

    for (const v of displayedValues) {
      expect(await screen.findByText(v)).toBeInTheDocument();

      const key = v.split(':')[0];
      if (booleanStorageKeys.has(key)) {
        expect(window.localStorage.getItem(key)).toBe('true');
      }
    }
  });
});
