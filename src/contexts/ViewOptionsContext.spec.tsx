import { render, screen } from '@testing-library/react';
import ViewOptionsContext, {
  defaultValues,
  ViewOptions,
  ViewOptionsContextProvider
} from './ViewOptionsContext';
import { useContext } from 'react';

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
  it('has all values initialized properly', async () => {
    await render(
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
