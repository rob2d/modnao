import { handleFileInput } from './useSupportedFilePicker';
import { loadTextureFile } from '../modelDataThunks';

describe('handleFileInput', () => {
  const onError = jest.fn();
  const dispatch = jest.fn();
  const polygonFilename = 'examplePolygonFileName';

  const getMockFilesWithNames = (filenames: string[]) =>
    filenames.map((n) => new File(['data'], n, { type: 'text/plain' }));

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    onError.mockClear();
    dispatch.mockClear();
  });

  it.each(['DM08CAB.BIN', 'dm08cab.bin', 'DM08CAB.mn.BIN'])(
    'dispatches %s to the raw texture loader without a polygon file',
    async (filename) => {
      const files = getMockFilesWithNames([filename]);
      const pendingActions: unknown[] = [];
      const thunkDispatch = jest.fn((thunk) =>
        thunk(
          (action: unknown) => pendingActions.push(action),
          () => ({
            modelData: {}
          })
        )
      );

      await handleFileInput(files, onError, thunkDispatch, undefined);

      expect(onError).not.toHaveBeenCalled();
      expect(thunkDispatch).toHaveBeenCalledTimes(1);
      expect(pendingActions[0]).toMatchObject({
        type: loadTextureFile.pending.type,
        meta: {
          arg: {
            file: files[0],
            textureFileType: 'mvc2-intro-cable-ruby',
            isLzssCompressed: false
          }
        }
      });
    }
  );

  it.each([
    ['DM08CAB.BIN', 'STG01POL.BIN'],
    ['STG01POL.BIN', 'DM08CAB.BIN'],
    ['DM08CAB.BIN', 'FONT.BIN']
  ])('rejects selecting %s with %s', async (...filenames) => {
    await handleFileInput(
      getMockFilesWithNames(filenames),
      onError,
      dispatch,
      undefined
    );

    expect(onError).toHaveBeenCalledTimes(1);
    expect(dispatch).not.toHaveBeenCalled();
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

  it('should accept a patch when a polygon file is loaded', async () => {
    await handleFileInput(
      getMockFilesWithNames(['stg01.mnp.zip']),
      onError,
      dispatch,
      polygonFilename
    );

    expect(onError).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('should reject a patch when no polygon file is loaded', async () => {
    await handleFileInput(
      getMockFilesWithNames(['stg01.mnp.zip']),
      onError,
      dispatch,
      undefined
    );

    expect(onError).toHaveBeenCalledWith(
      'Open the POL.BIN model you want to update before importing a patch.'
    );
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should reject a patch selected with another file', async () => {
    await handleFileInput(
      getMockFilesWithNames(['stg01.mnp.zip', 'STG01POL.BIN']),
      onError,
      dispatch,
      polygonFilename
    );

    expect(onError).toHaveBeenCalledWith(
      'Choose the patch file by itself. POL.BIN and TEX.BIN files must be loaded first.'
    );
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
      getMockFilesWithNames(['DC01POL.BIN', 'DC01TEX.BIN']),
      ...restParams
    );
    await handleFileInput(
      getMockFilesWithNames(['EFKYPOL.BIN', 'EFKYTEX.BIN']),
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
    await handleFileInput(getMockFilesWithNames(['FONT.BIN']), ...restParams);
    await handleFileInput(
      getMockFilesWithNames(['ENDNMTEX.BIN']),
      ...restParams
    );
    await handleFileInput(
      getMockFilesWithNames(['ENDDCTEX.BIN']),
      ...restParams
    );
    await handleFileInput(getMockFilesWithNames(['SELSTG.BIN']), ...restParams);
    await handleFileInput(getMockFilesWithNames(['SELVMJ.BIN']), ...restParams);
    await handleFileInput(getMockFilesWithNames(['SELVMU.BIN']), ...restParams);

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
