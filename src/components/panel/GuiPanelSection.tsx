import { useCallback, useState } from 'react';
import { mdiUnfoldLessHorizontal, mdiUnfoldMoreHorizontal } from '@mdi/js';
import {
  IconButton,
  ListSubheader,
  styled,
  Tooltip,
  Typography
} from '@mui/material';
import Icon from '@mdi/react';

const StyledSubheader = styled(ListSubheader)(
  ({ theme }) => `

  & {
  }
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    line-height: 1.5;
  }
  
  .header-text {
    display: flex;
    flex-direction: column;
  }
    
  & .collapsed-content {
    margin-top: ${theme.spacing(1)};
  }
  `
);

type Props = {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  collapsedContent?: React.ReactNode;
  collapsedContentFABs?: React.ReactNode[];
};

export default function GuiPanelSection({
  children,
  title,
  subtitle,
  collapsedContent,
  collapsedContentFABs
}: Props) {
  const [isExpanded, setExpanded] = useState(true);
  const toggleContentExpanded = useCallback(
    () => setExpanded(!isExpanded),
    [isExpanded]
  );

  return (
    <>
      <StyledSubheader id='nested-list-subheader'>
        <div className='section-header'>
          <div className='header-text'>
            <Typography variant='subtitle2'>{title}</Typography>
            {!subtitle ? undefined : (
              <Typography variant='caption'>{subtitle}</Typography>
            )}
          </div>
          {isExpanded ? undefined : collapsedContentFABs}
          <Tooltip title={`${isExpanded ? 'Collapse' : 'Expand'} section`}>
            <IconButton onClick={toggleContentExpanded}>
              <Icon
                path={
                  !isExpanded
                    ? mdiUnfoldLessHorizontal
                    : mdiUnfoldMoreHorizontal
                }
                size={1}
              />
            </IconButton>
          </Tooltip>
        </div>
        {!isExpanded ? (
          <div className='collapsed-content'>{collapsedContent}</div>
        ) : undefined}
      </StyledSubheader>
      {!isExpanded ? undefined : children}
    </>
  );
}
