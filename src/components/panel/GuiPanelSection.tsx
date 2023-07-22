import { useCallback, useState } from 'react';
import { mdiUnfoldLessHorizontal, mdiUnfoldMoreHorizontal } from '@mdi/js';
import { IconButton, ListSubheader, styled } from '@mui/material';
import Icon from '@mdi/react';

const StyledSubheader = styled(ListSubheader)(`& {
    display: flex;
    justify-content: space-between;
  }`);

type Props = {
  children: React.ReactNode;
  title: string;
};
export default function GuiPanelSection({ children, title }: Props) {
  const [isExpanded, setExpanded] = useState(true);
  const toggleContentExpanded = useCallback(
    () => setExpanded(!isExpanded),
    [isExpanded]
  );
  return (
    <>
      <StyledSubheader id='nested-list-subheader'>
        {title}
        <IconButton onClick={toggleContentExpanded}>
          <Icon
            path={
              isExpanded ? mdiUnfoldLessHorizontal : mdiUnfoldMoreHorizontal
            }
            size={1}
          />
        </IconButton>
      </StyledSubheader>
      {children}
    </>
  );
}
