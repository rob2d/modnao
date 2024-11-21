import textureFileTypeMap, {
  TextureFileType,
  TextureFileTypeMeta
} from '@/utils/textures/files/textureFileTypeMap';
import { showError } from '../errorMessagesSlice';
import { createAppAsyncThunk } from '../storeTypings';
import { loadPolygonFile, loadTextureFile } from '../modelDataSlice';
import FilesSupportedButton from '@/components/FilesSupportedButton';

const DEDICATED_TEXTURE_ERROR =
  'Dedicated texture files can only be edited individually at this moment, they cannot be selected with others';

/** polygon files which may be associated to textures */
export const POLYGON_FILE = /^(((STG|DM|DC)[0-9A-Z]{2})|EFKY)POL.BIN$/i;

export const textureFileEntries = Object.entries(textureFileTypeMap) as [
  TextureFileType,
  TextureFileTypeMeta
][];

const dedicatedTextureKVs = textureFileEntries.filter(
  ([, entry]) => !entry.polygonMapped
);

// onError: dispatch error action

export const handleSelectedFiles = createAppAsyncThunk(
  `modelData/handleSelectedFiles`,
  async (files: File[], { dispatch }): Promise<void> => {
    let textureFileType: TextureFileType | undefined;

    let selectedPolygonFile: File | undefined = undefined;
    let selectedTextureFile: File | undefined = undefined;

    let hasError = false;

    const handleError = (message: string | JSX.Element) => {
      dispatch(showError({ title: 'Invalid file selection', message }));
      selectedPolygonFile = undefined;
      selectedTextureFile = undefined;
      hasError = true;
    };

    files.forEach((f, i) => {
      if (hasError) {
        return;
      }

      if (
        textureFileType &&
        !textureFileTypeMap[textureFileType]?.polygonMapped
      ) {
        handleError(DEDICATED_TEXTURE_ERROR);
        return;
      }

      for (const [type, entry] of dedicatedTextureKVs) {
        if (f.name.match(entry.regexp)) {
          if (i > 0) {
            handleError(DEDICATED_TEXTURE_ERROR);
            return;
          }

          selectedTextureFile = f;
          textureFileType = type as TextureFileType;
          return;
        }
      }

      if (f.name.match(POLYGON_FILE)) {
        if (!selectedPolygonFile) {
          selectedPolygonFile = f;
        } else {
          handleError('Cannot select more than one polygon file at a time');
          return;
        }
      }

      for (const [fileTypeChecked, entry] of textureFileEntries) {
        if (f.name.match(entry.regexp)) {
          if (!selectedTextureFile) {
            selectedTextureFile = f;
            textureFileType = fileTypeChecked;
          } else {
            handleError('Cannot select more than one texture file');
            return;
          }
        }
      }
    });

    if (hasError) {
      return;
    }

    if (!selectedPolygonFile && !selectedTextureFile) {
      handleError(
        <>
          See
          <FilesSupportedButton />
          for more info.
        </>
      );
    }

    if (selectedPolygonFile) {
      await dispatch(loadPolygonFile(selectedPolygonFile));
    }

    if (
      selectedTextureFile &&
      textureFileType &&
      textureFileTypeMap?.[textureFileType].polygonMapped
    ) {
      if (selectedPolygonFile) {
        dispatch(
          loadTextureFile({ file: selectedTextureFile, textureFileType })
        );
      } else {
        handleError(
          <>
            ({(selectedTextureFile as File).name}): For this type of texture
            file, you must load a polygon file along with it. <br />
            You can hold control in most file selectors to select most files.
            <br />
            <FilesSupportedButton />
          </>
        );
        return;
      }
    }

    return;
  }
);
