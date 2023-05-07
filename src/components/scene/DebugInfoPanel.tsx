import {
  selectModel,
  selectModelCount,
  selectModelIndex,
  selectObjectIndex,
  selectObjectSelectionType
} from '@/store';
import { Typography, styled } from '@mui/material';
import { useSelector } from 'react-redux';

const Styled = styled('div')(
  ({ theme }) => `
    & {
        position: absolute;
        top: ${theme.spacing(2)};
        right: ${theme.spacing(2)};
        display: flex;
        flex-direction: column;
    }
    & .buttons {
      position: fixed;
      bottom: ${theme.spacing(2)};
      right: ${theme.spacing(2)};
      display: flex;
    }
  
    & .buttons > :first-child {
      right: ${theme.spacing(2)}
    }
  `
);

export default function DebugInfoPanel() {
  const modelIndex = useSelector(selectModelIndex);
  const modelCount = useSelector(selectModelCount);
  const objectIndex = useSelector(selectObjectIndex);
  const objectSelectionType = useSelector(selectObjectSelectionType);

  return (
    <Styled>
      <Typography variant='subtitle1' textAlign='right'>
        Model Index&nbsp;&nbsp;<b>{modelIndex === -1 ? 'N/A' : modelIndex}</b>
      </Typography>
      <Typography variant='subtitle1' textAlign='right'>
        Model Count&nbsp;&nbsp;<b>{modelCount}</b>
      </Typography>
      <Typography variant='subtitle1' textAlign='right'>
        Selection Mode&nbsp;&nbsp;<b>{objectSelectionType}</b>
      </Typography>
      <Typography variant='subtitle1' textAlign='right'>
        Object Index&nbsp;&nbsp;
        <b>{objectIndex === -1 ? 'N/A' : objectIndex}</b>
      </Typography>
    </Styled>
  );
}
