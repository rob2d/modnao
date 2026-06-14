import React, { MouseEventHandler, ReactNode } from 'react';
import { Button, Tooltip } from '@mui/material';

type Props = {
  children: ReactNode;
  onClick: MouseEventHandler<HTMLButtonElement>;
  tooltip: ReactNode | string;
  color?: 'primary' | 'inherit' | 'secondary';
  id?: string;
};

export default function GuiPanelButton({
  id,
  tooltip,
  color = 'primary',
  onClick,
  children
}: Props) {
  return (
    <Tooltip title={tooltip}>
      <Button
        id={id}
        onClick={onClick}
        color={color}
        fullWidth
        size='small'
        variant='outlined'
      >
        {children}
      </Button>
    </Tooltip>
  );
}
