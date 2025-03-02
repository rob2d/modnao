import { useSupportedFilePicker } from '@/hooks';
import { useAppDispatch } from '@/store';
import { showError } from '@/store/errorMessages/errorMessagesSlice';
import { styled } from '@mui/material/styles';
import { useCallback } from 'react';
import GuiPanelButton from './GuiPanelButton';
import FilesSupportedButton from '../FilesSupportedButton';

const StyledImportButton = styled('div')(
  ({ theme }) => `
    .supported-files {
      font-size: 8pt;
      margin-top: -${theme.spacing(1)};
    }
      
    & {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    ${/* panel expanded variant */ ''}

    .panel:not(.welcome).expanded-2 & {
      margin-bottom: ${theme.spacing(1)};
    }

    .panel:not(.welcome).expanded .collapsed-content & {
      margin-bottom: 0;
    }

    .panel:not(.welcome).expanded & #select-pol-or-tex-button {
      height: 72px;
    }

    .panel:not(.welcome).expanded .collapsed-content & #select-pol-or-tex-button {
      height: unset;
    }
  
    .expanded .content & .supported-files, .panel:not(.welcome).expanded & .supported-files {
      margin-top: 0;
    }
  
    .content & .supported-files {
      width: 100%;
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
    <StyledImportButton>
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
