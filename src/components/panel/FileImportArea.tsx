import SearchIcon from '@mui/icons-material/Search';
import { selectContentViewMode } from '@/selectors';
import { useSupportedFilePicker } from '@/modules/model-data';
import { showError } from '@/modules/error-messages';
import { useAppDispatch, useAppSelector } from '@/storeTypings';
import { Box, IconButton } from '@mui/material';
import { JSX, useCallback } from 'react';
import GuiPanelButton from './GuiPanelButton';
import FilesSupportedButton from '../FilesSupportedButton';
import SearchForFiles from '../SearchForFiles';

export default function FileImportArea() {
  const dispatch = useAppDispatch();
  const contentViewMode = useAppSelector(selectContentViewMode);
  const onHandleError = useCallback((message: string | JSX.Element) => {
    dispatch(showError({ title: 'Invalid file selection', message }));
  }, []);
  const openFileSelector = useSupportedFilePicker(onHandleError);

  // @TODO lay out in more flexibly/auto-adaptably
  return (
    <Box
      className='file-import-area'
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        '& .supported-files': {
          fontSize: '8pt',
          mt: -1
        },
        '.panel:not(.welcome).expanded-2 &': {
          mb: 1
        },
        '.panel:not(.welcome).expanded .collapsed-content &': {
          mb: 0
        },
        '.expanded .content & .supported-files, .panel:not(.welcome).expanded & .supported-files':
          {
            mt: 0
          },
        '.content & .supported-files': {
          width: '100%',
          mt: -1
        }
      }}
    >
      <GuiPanelButton
        id='select-pol-or-tex-button'
        tooltip='Select MVC2, CVS1, or CVS2 POL.BIN and/or TEX.BIN files'
        onClick={openFileSelector}
      >
        Import Model/Texture
      </GuiPanelButton>

      <FilesSupportedButton className={'supported-files'} />
      {contentViewMode !== 'welcome' ? null : <SearchForFiles />}
    </Box>
  );
}
