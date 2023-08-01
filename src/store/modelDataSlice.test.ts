import modelDataSlice, { initialModelDataState } from './modelDataSlice';

test('should return the initial state', () => {
  expect(modelDataSlice.reducer(undefined, { type: undefined })).toEqual([
    initialModelDataState
  ]);
});
