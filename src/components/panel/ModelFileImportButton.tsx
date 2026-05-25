import { useSupportedFilePicker } from '@/modules/model-data';
import { showError } from '@/modules/error-messages';
import { useAppDispatch } from '@/storeTypings';
import { Box } from '@mui/material';
import { JSX, useCallback } from 'react';
import GuiPanelButton from './GuiPanelButton';
import FilesSupportedButton from '../FilesSupportedButton';

export default function ModelFileImportButton() {
  const dispatch = useAppDispatch();
  const onHandleError = useCallback((message: string | JSX.Element) => {
    dispatch(showError({ title: 'Invalid file selection', message }));
  }, []);
  const openFileSelector = useSupportedFilePicker(onHandleError);

  return (
    <Box
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
        '.panel:not(.welcome).expanded & #select-pol-or-tex-button': {
          height: '72px'
        },
        '.panel:not(.welcome).expanded .collapsed-content & #select-pol-or-tex-button':
          {
            height: 'unset'
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
    </Box>
  );
}
