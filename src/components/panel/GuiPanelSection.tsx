import { useCallback, useState } from 'react';
import { mdiUnfoldLessHorizontal, mdiUnfoldMoreHorizontal } from '@mdi/js';
import {
  IconButton,
  ListSubheader,
  Tooltip,
  Typography,
  styled
} from '@mui/material';
import Icon from '@mdi/react';

const StyledSubheader = styled(ListSubheader)(`& {
    display: flex;
    align-items: center;
    justify-content: space-between;
    line-height: 1.5;
  }
  
  .header-text {
    display: flex;
    flex-direction: column;
  }`);

type Props = {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
};
export default function GuiPanelSection({ children, title, subtitle }: Props) {
  const [isExpanded, setExpanded] = useState(true);
  const toggleContentExpanded = useCallback(
    () => setExpanded(!isExpanded),
    [isExpanded]
  );
  return (
    <>
      <StyledSubheader id='nested-list-subheader'>
        <div className={'.header-text'}>
          <Typography variant='subtitle2'>{title}</Typography>
          {!subtitle ? undefined : (
            <Typography variant='caption'>{subtitle}</Typography>
          )}
        </div>
        <Tooltip title={`${isExpanded ? 'Collapse' : 'Expand'} section`}>
          <IconButton onClick={toggleContentExpanded}>
            <Icon
              path={
                isExpanded ? mdiUnfoldLessHorizontal : mdiUnfoldMoreHorizontal
              }
              size={1}
            />
          </IconButton>
        </Tooltip>
      </StyledSubheader>
      {!isExpanded ? undefined : children}
    </>
  );
}
