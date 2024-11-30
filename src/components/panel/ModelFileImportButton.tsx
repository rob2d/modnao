import { useSupportedFilePicker } from '@/hooks';
import { useAppDispatch } from '@/store';
import { showError } from '@/store/errorMessagesSlice';
import { styled } from '@mui/material/styles';
import { useCallback } from 'react';
import GuiPanelButton from './GuiPanelButton';
import FilesSupportedButton from '../FilesSupportedButton';

const StyledImportButton = styled('div')(
  ({ theme }) => `
    .supported-files {
      width: 100%;
      font-size: 8pt;
      margin-top: -${theme.spacing(2)};
    }
      
    .content & {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      width: 100%;
    }

    ${/* panel expanded variant */ ''}

    .expanded .content & {
      flex-direction: row;
      align-items: center;
      margin-bottom: ${theme.spacing(1)};
    }
  
    .expanded .content & .supported-files {
      margin-top: 0;
    }
  
    .content & .supported-files {
      margin-top: -${theme.spacing(1)};
    }
    `
);

export default function ModelFileImportButton() {
  const dispatch = useAppDispatch();
  const onHandleError = useCallback((message: string | JSX.Element) => {
    dispatch(showError({ title: 'Invalid file selection', message }));
  }, []);
  const openFileSelector = useSupportedFilePicker(onHandleError);

  return (
    <StyledImportButton className='file-selection-buttons'>
      <GuiPanelButton
        id='select-pol-or-tex-button'
        tooltip='Select an MVC2 or CVS2 STG POL.BIN and/or TEX.BIN files'
        onClick={openFileSelector}
      >
        Import Model/Texture
      </GuiPanelButton>
      <FilesSupportedButton className={'supported-files'} />
    </StyledImportButton>
  );
}
