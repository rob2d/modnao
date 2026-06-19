import React, { MouseEventHandler, ReactNode } from 'react';
import { type BoxProps, Button, Tooltip } from '@mui/material';

type Props = {
  children: ReactNode;
  onClick: MouseEventHandler<HTMLButtonElement>;
  tooltip: ReactNode | string;
  color?: 'primary' | 'inherit' | 'secondary';
  id?: string;
  sx: BoxProps['sx'];
};

export default function GuiPanelButton({
  id,
  tooltip,
  color = 'primary',
  onClick,
  children,
  sx
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
        sx={sx}
      >
        {children}
      </Button>
    </Tooltip>
  );
}
