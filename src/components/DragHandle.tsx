import { styled } from '@mui/material';

const StyledPaper = styled(DragHandle)(({ theme }) => {});

export default function DragHandle() {
  return <div className='drag-handle' />;
}
