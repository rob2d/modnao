import FilesSupportedButton from '@/components/FilesSupportedButton';
import resourceAttribMappings from '@/constants/resourceAttribMappings';
import { $modelData } from '@/modules/model-data/modelDataStore';
import type { TextureFileType } from '@/types';
import { JSX, useEffect } from 'react';
import { useFilePicker } from 'use-file-picker';
import loadModelDataPatch from '../loadModelDataPatch';
import {
  loadCharacterPortraitsFile,
  loadPolygonFile,
  loadTextureFile
} from '../modelDataThunks';
import { MODEL_DATA_PATCH_EXTENSION } from '../validateModelDataPatchCompatibility';

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
  polygonFilename: string | undefined
) => {
  if (!files[0]) {
    return;
  }

  const patchFile = files.find((file) =>
    file.name.toLowerCase().endsWith(MODEL_DATA_PATCH_EXTENSION)
  );

  if (patchFile) {
    if (files.length > 1) {
      onError(
        'Choose the patch file by itself. POL.BIN and TEX.BIN files must be loaded first.'
      );
      return;
    }

    if (!polygonFilename) {
      onError(
        'Open the POL.BIN model you want to update before importing a patch.'
      );
      return;
    }

    loadModelDataPatch(patchFile);
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
    await loadPolygonFile(selectedPolygonFile);
  }

  if (
    selectedTextureFile &&
    textureFileType &&
    resourceAttribMappings[textureFileType].polygonMapped
  ) {
    if (polygonFilename || selectedPolygonFile) {
      loadTextureFile({
        file: selectedTextureFile,
        textureFileType
      });
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
      loadCharacterPortraitsFile(selectedTextureFile);
      break;
    }
    case 'mvc2-font-file':
    case 'mvc2-selection-vmu-jp':
    case 'mvc2-selection-vmu-us':
    case 'mvc2-intro-cable-ruby':
      loadTextureFile({
        file: selectedTextureFile,
        textureFileType,
        isLzssCompressed: false
      });
      break;
    case 'mvc2-character-win':
    case 'mvc2-stage-preview':
    case 'mvc2-selection-textures':
    case 'mvc2-end-file': {
      loadTextureFile({
        file: selectedTextureFile,
        textureFileType,
        isLzssCompressed: true
      });
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
  'use no memo';

  const polygonFilename = $modelData.value.polygonFileName;
  const { plainFiles, openFilePicker } = useFilePicker({
    multiple: true,
    readAs: 'ArrayBuffer',
    accept: ['.BIN', MODEL_DATA_PATCH_EXTENSION]
  });

  useEffect(() => {
    if (plainFiles.length) {
      handleFileInput(plainFiles, onError, polygonFilename);
    }
  }, [plainFiles]);

  return openFilePicker;
}
