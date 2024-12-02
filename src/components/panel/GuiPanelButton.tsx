import React from 'react';
import { Button, Tooltip } from '@mui/material';

type Props = {
  children: React.ReactNode;
  onClick: () => void;
  tooltip: React.ReactNode | string;
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
