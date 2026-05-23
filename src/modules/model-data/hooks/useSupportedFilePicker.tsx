import { JSX, useEffect } from 'react';
import { useFilePicker } from 'use-file-picker';
import {
  loadCharacterPortraitsFile,
  loadPolygonFile,
  loadTextureFile
} from '../modelDataThunks';
import { useAppDispatch, useAppSelector } from '@/storeTypings';
import FilesSupportedButton from '@/components/FilesSupportedButton';
import resourceAttribMappings from '@/constants/resourceAttribMappings';
import type { TextureFileType } from '@/types';

/** polygon files which may be associated to textures */
export const POLYGON_FILE = /^(((STG|DM|DC)[0-9A-Z]{2})|EFKY)POL.BIN$/i;

export const textureFileEntries = Object.entries(resourceAttribMappings)
  .filter(
    ([resourceHashKey, attribs]) => attribs.textureFileType === resourceHashKey
  )
  .map(
    ([textureFileType, attribs]) =>
      [textureFileType as TextureFileType, attribs] as const
  );

const dedicatedTextureEntries = textureFileEntries.filter(
  ([textureFileType]) => !resourceAttribMappings[textureFileType].polygonMapped
);

export const handleFileInput = async (
  files: File[],
  onError: (error: string | JSX.Element) => void,
  dispatch: ReturnType<typeof useAppDispatch>,
  polygonFilename: string | undefined
) => {
  if (!files[0]) {
    return;
  }

  let textureFileType: TextureFileType | undefined;

  let selectedPolygonFile: File | undefined = undefined;
  let selectedTextureFile: File | undefined = undefined;

  let hasError = false;
  const handleError = (error: string | JSX.Element) => {
    selectedPolygonFile = undefined;
    selectedTextureFile = undefined;
    hasError = true;
    onError(error);
    return;
  };

  const DEDICATED_TEXTURE_FILE_ERROR =
    'Dedicated texture files can only be edited individually at this moment, they cannot be selected with others';

  files.forEach((f, i) => {
    if (hasError) {
      return;
    }

    if (
      textureFileType &&
      !resourceAttribMappings[textureFileType].polygonMapped
    ) {
      handleError(DEDICATED_TEXTURE_FILE_ERROR);
      return;
    }

    for (const [type, attribs] of dedicatedTextureEntries) {
      if (new RegExp(attribs.filenamePattern, 'i').test(f.name)) {
        if (i > 0) {
          handleError(DEDICATED_TEXTURE_FILE_ERROR);
          return;
        }

        selectedTextureFile = f;
        textureFileType = type;
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

    for (const [fileTypeChecked, attribs] of textureFileEntries) {
      if (new RegExp(attribs.filenamePattern, 'i').test(f.name)) {
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
    return;
  }

  if (selectedPolygonFile) {
    await dispatch(loadPolygonFile(selectedPolygonFile));
  }

  if (
    selectedTextureFile &&
    textureFileType &&
    resourceAttribMappings[textureFileType].polygonMapped
  ) {
    if (polygonFilename || selectedPolygonFile) {
      dispatch(
        loadTextureFile({
          file: selectedTextureFile,
          textureFileType
        })
      );
    } else {
      handleError(
        <>
          For this type of texture file, you must load a polygon file along with
          it. <br />
          You can hold control in most file selectors to select most files.
          <br />
          <FilesSupportedButton />
        </>
      );
      return;
    }
  }

  if (!selectedTextureFile) {
    return;
  }

  switch (textureFileType) {
    case 'mvc2-character-portraits': {
      dispatch(loadCharacterPortraitsFile(selectedTextureFile));
      break;
    }
    case 'mvc2-font-file':
    case 'mvc2-selection-vmu-jp':
    case 'mvc2-selection-vmu-us':
      dispatch(
        loadTextureFile({
          file: selectedTextureFile,
          textureFileType,
          isLzssCompressed: false
        })
      );
      break;
    case 'mvc2-character-win':
    case 'mvc2-stage-preview':
    case 'mvc2-selection-textures':
    case 'mvc2-end-file': {
      dispatch(
        loadTextureFile({
          file: selectedTextureFile,
          textureFileType,
          isLzssCompressed: true
        })
      );
      break;
    }
    default: {
      return;
    }
  }
};

/**
 * handle a user selection of a file client-side
 * in order to dispatch action to stream that data
 * into state
 *
 * @returns open-filepicker callback
 */
export default function useSupportedFilePicker(
  onError: (error: string | JSX.Element) => void
) {
  const polygonFilename = useAppSelector((s) => s.modelData.polygonFileName);
  const dispatch = useAppDispatch();
  const { plainFiles, openFilePicker } = useFilePicker({
    multiple: true,
    readAs: 'ArrayBuffer',
    accept: ['.BIN']
  });

  useEffect(() => {
    if (plainFiles.length) {
      handleFileInput(plainFiles, onError, dispatch, polygonFilename);
    }
  }, [plainFiles]);

  return openFilePicker;
}
