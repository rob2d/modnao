import { render, screen } from '@testing-library/react';
import ViewOptionsContext, {
  defaultValues,
  ViewOptions,
  ViewOptionsContextProvider
} from './ViewOptionsContext';
import { useContext } from 'react';
import React from 'react';

const viewOptionsKeys = Object.keys(defaultValues) as (keyof ViewOptions)[];
const getOptionRenderKeys = (viewOptions: ViewOptions) =>
  viewOptionsKeys.filter((k) => typeof viewOptions[k] !== 'function');

const booleanSetterKeys = [
  'setSceneCursorVisible',
  'setAxesHelperVisible',
  'setObjectAddressesVisible',
  'setDevOptionsVisible',
  'setUvRegionsHighlighted',
  'setDisableBackfaceCulling',
  'setEnableVertexColors',
  'setRenderAllModels'
] as const;

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
});
