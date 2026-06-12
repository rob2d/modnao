import { ReactNode, SyntheticEvent } from 'react';
import { Checkbox, FormControlLabel, Tooltip } from '@mui/material';

type Props = {
  checked: boolean;
  icon?: ReactNode;
  label?: string;
  tooltipHint: string;
  tooltipPlacement?:
    | 'bottom'
    | 'left'
    | 'right'
    | 'top'
    | 'top-start'
    | 'bottom-end'
    | 'bottom-start'
    | 'left-end'
    | 'left-start'
    | 'right-end'
    | 'right-start'
    | 'top-end'
    | undefined;
  onChange: (_: SyntheticEvent<Element, Event>, checked: boolean) => void;
};
export default function SceneOptionCheckbox({
  checked,
  onChange,
  icon,
  label,
  tooltipHint,
  tooltipPlacement
}: Props) {
  return (
    <Tooltip title={tooltipHint} placement={tooltipPlacement}>
      <FormControlLabel
        control={<Checkbox checked={checked} sx={{ p: 0.5 }} />}
        label={
          <>
            {icon ?? undefined}
            {label ?? undefined}
          </>
        }
        labelPlacement='start'
        onChange={onChange}
      />
    </Tooltip>
  );
}
