import { showError } from '@/modules/error-messages';
import { useSupportedFilePicker } from '@/modules/model-data';
import { setObjectViewedIndex } from '@/modules/object-viewer';
import {
  $polygonFileName,
  $resourceAttribs
} from '@/modules/model-data/modelDataStore';
import { $contentViewMode } from '@/derivedState';
import { Box } from '@mui/material';
import { JSX, useCallback } from 'react';
import FilesSupportedButton from '../FilesSupportedButton';
import ResourceNavigator, {
  type ResourceNavigatorOption
} from '../ResourceNavigator';
import GuiPanelActionButtonRow from './GuiPanelActionButtonRow';
import GuiPanelButton from './GuiPanelButton';

export default function FileImportArea() {
  'use no memo';

  const contentViewMode = $contentViewMode.value;
  const hasLoadedPolygonFile = Boolean($polygonFileName.value);
  const resourceAttribs = $resourceAttribs.value;
  const onHandleError = useCallback((message: string | JSX.Element) => {
    showError({ title: 'Invalid file selection', message });
  }, []);
  const openFileSelector = useSupportedFilePicker(onHandleError);

  const onSelectResourceNavigatorOption = useCallback(
    (option: ResourceNavigatorOption) => {
      if (contentViewMode !== 'polygons' || option.kind !== 'model') {
        return false;
      }

      setObjectViewedIndex(Number(option.modelIndex));

      return true;
    },
    [contentViewMode]
  );

  return (
    <Box
      className='file-import-area'
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        width: '100%'
      }}
    >
      <GuiPanelActionButtonRow>
        <GuiPanelButton
          id='select-pol-or-tex-button'
          tooltip={
            hasLoadedPolygonFile
              ? 'Select supported POL.BIN, TEX.BIN, or .mnp.zip to patch loaded files'
              : 'Select supported POL.BIN or TEX.BIN files'
          }
          onClick={openFileSelector}
          sx={{ '&&&': { mb: 0 } }}
        >
          Import files
        </GuiPanelButton>

        <FilesSupportedButton />
      </GuiPanelActionButtonRow>

      <ResourceNavigator
        includeSourceResourceOption={contentViewMode === 'welcome'}
        label={
          contentViewMode === 'welcome'
            ? 'Find supported resources'
            : 'Find model in resource'
        }
        onSelectOption={onSelectResourceNavigatorOption}
        scope={resourceAttribs}
        sx={{ my: 0.5 }}
      />
    </Box>
  );
}
