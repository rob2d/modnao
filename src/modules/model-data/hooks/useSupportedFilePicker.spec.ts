import loadModelDataPatch from '../loadModelDataPatch';
import {
  loadCharacterPortraitsFile,
  loadPolygonFile,
  loadTextureFile
} from '../modelDataThunks';
import { handleFileInput } from './useSupportedFilePicker';

jest.mock('../modelDataThunks', () => ({
  loadTextureFile: jest.fn(),
  loadPolygonFile: jest.fn(),
  loadCharacterPortraitsFile: jest.fn()
}));
jest.mock('../loadModelDataPatch', () => ({
  __esModule: true,
  default: jest.fn()
}));

describe('handleFileInput', () => {
  const onError = jest.fn();

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
    jest.clearAllMocks();
  });

  it.each(['DM08CAB.BIN', 'dm08cab.bin', 'DM08CAB.mn.BIN'])(
    'dispatches %s to the raw texture loader without a polygon file',
    async (filename) => {
      const files = getMockFilesWithNames([filename]);
      await handleFileInput(files, onError, undefined);

      expect(onError).not.toHaveBeenCalled();
      expect(loadTextureFile).toHaveBeenCalledWith({
        file: files[0],
        textureFileType: 'mvc2-intro-cable-ruby',
        isLzssCompressed: false
      });
    }
  );

  it.each([
    ['DM08CAB.BIN', 'STG01POL.BIN'],
    ['STG01POL.BIN', 'DM08CAB.BIN'],
    ['DM08CAB.BIN', 'FONT.BIN']
  ])('rejects selecting %s with %s', async (...filenames) => {
    await handleFileInput(getMockFilesWithNames(filenames), onError, undefined);

    expect(onError).toHaveBeenCalledTimes(1);
    expect(loadTextureFile).not.toHaveBeenCalled();
    expect(loadPolygonFile).not.toHaveBeenCalled();
    expect(loadCharacterPortraitsFile).not.toHaveBeenCalled();
    expect(loadModelDataPatch).not.toHaveBeenCalled();
  });

  it('should do nothing when no files are selected', async () => {
    const files: File[] = [];
    await handleFileInput(files, onError, polygonFilename);

    expect(loadTextureFile).not.toHaveBeenCalled();
    expect(loadPolygonFile).not.toHaveBeenCalled();
    expect(loadCharacterPortraitsFile).not.toHaveBeenCalled();
    expect(loadModelDataPatch).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  it('should handle an invalid file', async () => {
    const files: File[] = [
      new File(['data'], 'invalid.txt', { type: 'text/plain' })
    ];

    await handleFileInput(files, onError, polygonFilename);

    expect(onError).toHaveBeenCalledTimes(1);
    expect(loadTextureFile).not.toHaveBeenCalled();
    expect(loadPolygonFile).not.toHaveBeenCalled();
    expect(loadCharacterPortraitsFile).not.toHaveBeenCalled();
    expect(loadModelDataPatch).not.toHaveBeenCalled();
  });

  it('should accept a patch when a polygon file is loaded', async () => {
    await handleFileInput(
      getMockFilesWithNames(['stg01.mnp.zip']),
      onError,
      polygonFilename
    );

    expect(onError).not.toHaveBeenCalled();
    expect(loadModelDataPatch).toHaveBeenCalledTimes(1);
  });

  it('should reject a patch when no polygon file is loaded', async () => {
    await handleFileInput(
      getMockFilesWithNames(['stg01.mnp.zip']),
      onError,
      undefined
    );

    expect(onError).toHaveBeenCalledWith(
      'Open the POL.BIN model you want to update before importing a patch.'
    );
    expect(loadTextureFile).not.toHaveBeenCalled();
    expect(loadPolygonFile).not.toHaveBeenCalled();
    expect(loadCharacterPortraitsFile).not.toHaveBeenCalled();
    expect(loadModelDataPatch).not.toHaveBeenCalled();
  });

  it('should reject a patch selected with another file', async () => {
    await handleFileInput(
      getMockFilesWithNames(['stg01.mnp.zip', 'STG01POL.BIN']),
      onError,
      polygonFilename
    );

    expect(onError).toHaveBeenCalledWith(
      'Choose the patch file by itself. POL.BIN and TEX.BIN files must be loaded first.'
    );
    expect(loadTextureFile).not.toHaveBeenCalled();
    expect(loadPolygonFile).not.toHaveBeenCalled();
    expect(loadCharacterPortraitsFile).not.toHaveBeenCalled();
    expect(loadModelDataPatch).not.toHaveBeenCalled();
  });

  it('should handle supported sets of files without an error', async () => {
    const restParams = [onError, polygonFilename] as const;

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
      polygonFilename
    );

    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('should error when two polygon-mapped texture files are selected', async () => {
    await handleFileInput(
      getMockFilesWithNames(['STG01TEX.BIN', 'STG02TEX.BIN']),
      onError,
      polygonFilename
    );

    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('should error when two valid files and one extra are selected', async () => {
    await handleFileInput(
      getMockFilesWithNames(['STG01POL.BIN', 'STG01TEX.BIN', 'STG02POL.BIN']),
      onError,
      polygonFilename
    );

    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('should error when two dedicated texture files are selected', async () => {
    await handleFileInput(
      getMockFilesWithNames(['PL01_FAC.BIN', 'PL02_FAC.BIN']),
      onError,
      polygonFilename
    );

    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('should error when a texture file that requires a polygon file does not have a polygon file loaded', async () => {
    await handleFileInput(
      getMockFilesWithNames(['STG01TEX.BIN']),
      onError,
      undefined
    );

    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('should not error or dispatch if no files were selected', async () => {
    await handleFileInput(getMockFilesWithNames([]), onError, polygonFilename);

    expect(onError).not.toHaveBeenCalled();
    expect(loadTextureFile).not.toHaveBeenCalled();
    expect(loadPolygonFile).not.toHaveBeenCalled();
    expect(loadCharacterPortraitsFile).not.toHaveBeenCalled();
    expect(loadModelDataPatch).not.toHaveBeenCalled();
  });
});
