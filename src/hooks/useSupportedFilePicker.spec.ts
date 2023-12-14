import { handleFileInput } from './useSupportedFilePicker';

describe('handleFileInput', () => {
  const onError = jest.fn();
  const dispatch = jest.fn();
  const polygonFilename = 'examplePolygonFileName';

  const getMockFilesWithNames = (filenames: string[]) =>
    filenames.map((n) => new File(['data'], n, { type: 'text/plain' }));

  afterEach(() => {
    onError.mockClear();
    dispatch.mockClear();
  });

  it('should do nothing when no files are selected', async () => {
    const files: File[] = [];
    await handleFileInput(files, onError, dispatch, polygonFilename);

    expect(dispatch).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  it('should handle an invalid file', async () => {
    const files: File[] = [
      new File(['data'], 'invalid.txt', { type: 'text/plain' })
    ];

    await handleFileInput(files, onError, dispatch, polygonFilename);

    expect(onError).toHaveBeenCalledTimes(1);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should handle supported sets of files without an error', async () => {
    const restParams = [onError, dispatch, polygonFilename] as const;

    await handleFileInput(
      getMockFilesWithNames(['STG01POL.BIN', 'STG01TEX.BIN']),
      ...restParams
    );
    await handleFileInput(
      getMockFilesWithNames(['DM01POL.BIN', 'DM01TEX.BIN']),
      ...restParams
    );
    await handleFileInput(
      getMockFilesWithNames(['DM01POL.BIN']),
      ...restParams
    );
    await handleFileInput(
      getMockFilesWithNames(['PL01_FAC.BIN']),
      ...restParams
    );
    await handleFileInput(
      getMockFilesWithNames(['PL01_WIN.BIN']),
      ...restParams
    );
    await handleFileInput(
      getMockFilesWithNames(['ENDNMTEX.BIN']),
      ...restParams
    );
    await handleFileInput(
      getMockFilesWithNames(['ENDDCTEX.BIN']),
      ...restParams
    );
    await handleFileInput(getMockFilesWithNames(['SELSTG.BIN']), ...restParams);

    expect(onError).not.toHaveBeenCalled();
  });

  it('should error when two polygon files are selected', async () => {
    await handleFileInput(
      getMockFilesWithNames(['STG01POL.BIN', 'STG02POL.BIN']),
      onError,
      dispatch,
      polygonFilename
    );

    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('should error when two polygon-mapped texture files are selected', async () => {
    await handleFileInput(
      getMockFilesWithNames(['STG01TEX.BIN', 'STG02TEX.BIN']),
      onError,
      dispatch,
      polygonFilename
    );

    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('should error when two valid files and one extra are selected', async () => {
    await handleFileInput(
      getMockFilesWithNames(['STG01POL.BIN', 'STG01TEX.BIN', 'STG02POL.BIN']),
      onError,
      dispatch,
      polygonFilename
    );

    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('should error when two dedicated texture files are selected', async () => {
    await handleFileInput(
      getMockFilesWithNames(['PL01_FAC.BIN', 'PL02_FAC.BIN']),
      onError,
      dispatch,
      polygonFilename
    );

    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('should error when a texture file that requires a polygon file does not have a polygon file loaded', async () => {
    await handleFileInput(
      getMockFilesWithNames(['STG01TEX.BIN']),
      onError,
      dispatch,
      undefined
    );

    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('should not error or dispatch if no files were selected', async () => {
    await handleFileInput(
      getMockFilesWithNames([]),
      onError,
      dispatch,
      polygonFilename
    );

    expect(onError).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });
});
