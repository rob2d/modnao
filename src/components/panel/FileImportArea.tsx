import { selectContentViewMode, selectResourceAttribs } from '@/selectors';
import { useSupportedFilePicker } from '@/modules/model-data';
import { showError } from '@/modules/error-messages';
import { setObjectViewedIndex } from '@/modules/object-viewer';
import { useAppDispatch, useAppSelector } from '@/storeTypings';
import { Box } from '@mui/material';
import { JSX, useCallback } from 'react';
import GuiPanelButton from './GuiPanelButton';
import FilesSupportedButton from '../FilesSupportedButton';
import ResourceNavigator, {
  type ResourceNavigatorOption
} from '../ResourceNavigator';
import GuiPanelActionButtonRow from './GuiPanelActionButtonRow';

export default function FileImportArea() {
  const dispatch = useAppDispatch();
  const contentViewMode = useAppSelector(selectContentViewMode);
  const resourceAttribs = useAppSelector(selectResourceAttribs);
  const onHandleError = useCallback((message: string | JSX.Element) => {
    dispatch(showError({ title: 'Invalid file selection', message }));
  }, []);
  const openFileSelector = useSupportedFilePicker(onHandleError);

  const onSelectResourceNavigatorOption = useCallback(
    (option: ResourceNavigatorOption) => {
      if (contentViewMode !== 'polygons' || option.kind !== 'model') {
        return false;
      }

      dispatch(setObjectViewedIndex(Number(option.modelIndex)));

      return true;
    },
    [contentViewMode, dispatch]
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
          tooltip='Select MVC2, CVS1, or CVS2 POL.BIN and/or TEX.BIN files'
          onClick={openFileSelector}
          sx={{ '&&&': { mb: 0 } }}
        >
          Import Model/Texture
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
