import { styled } from '@mui/material';
import { ReactNode } from 'react';

const Styled = styled('div')(
  ({ theme }) => `
& {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;
    padding: 0 ${theme.spacing(1)};
}

& > * {
    flex-shrink: 0;
    margin-left: ${theme.spacing(1)};
    margin-right: ${theme.spacing(1)};
    margin-bottom: ${theme.spacing(2)};
}
`
);

export type Props = { children: ReactNode };
export default function DialogSectionContentCards({ children }: Props) {
  return <Styled>{children}</Styled>;
}
