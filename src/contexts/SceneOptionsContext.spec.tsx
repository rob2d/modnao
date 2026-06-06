import { render, screen } from '@testing-library/react';
import SceneOptionsContext, {
  defaultValues,
  SceneOptions,
  SceneOptionsContextProvider
} from './SceneOptionsContext';
import { useContext } from 'react';
import React from 'react';

const viewOptionsKeys = Object.keys(defaultValues) as (keyof SceneOptions)[];
const getOptionRenderKeys = (sceneOptions: SceneOptions) =>
  viewOptionsKeys.filter((k) => typeof sceneOptions[k] !== 'function');

const booleanSetterKeys = [
  'setSceneCursorVisible',
  'setShowBrowsedObjectHints',
  'setAxesHelperVisible',
  'setObjectAddressesVisible',
  'setDevOptionsVisible',
  'setUvRegionsHighlighted',
  'setDisableBackfaceCulling',
  'setEnableVertexColors',
  'setRenderAllModels'
] as const;

function TestOptionsContext() {
  const sceneOptions: SceneOptions = useContext(SceneOptionsContext);

  return (
    <>
      {getOptionRenderKeys(sceneOptions).map((k) => (
        <p key={k}>{`${k}: ${sceneOptions[k]}`}</p>
      ))}
      {booleanSetterKeys.map((k) => (
        <React.Fragment key={k}>
          <button
            data-testid={`${k}-true`}
            key={`${k}-true`}
            onClick={() => sceneOptions[k](true)}
          >{`setter(${k}, true)`}</button>
          <button
            data-testid={`${k}-false`}
            key={`${k}-false`}
            onClick={() => sceneOptions[k](false)}
          >{`setter(${k}, false)`}</button>
        </React.Fragment>
      ))}
    </>
  );
}

describe('SceneOptionsContext', () => {
  it('has all values initialized properly', () => {
    render(
      <SceneOptionsContextProvider>
        <TestOptionsContext />
      </SceneOptionsContextProvider>
    );

    const displayedDefaults = getOptionRenderKeys(defaultValues).map(
      (k) => `${k}: ${defaultValues[k]}`
    );

    displayedDefaults.forEach((d) =>
      expect(screen.getByText(d)).toBeInTheDocument()
    );
  });
});
