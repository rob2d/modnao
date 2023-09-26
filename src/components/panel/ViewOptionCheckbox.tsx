import Icon from '@mdi/react';
import { Checkbox, FormControlLabel, Tooltip } from '@mui/material';
import { SyntheticEvent } from 'react';

type Props = {
  checked: boolean;
  iconPath?: string;
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
export default function ViewOptionCheckbox({
  checked,
  onChange,
  iconPath,
  label,
  tooltipHint,
  tooltipPlacement
}: Props) {
  return (
    <Tooltip title={tooltipHint} placement={tooltipPlacement}>
      <FormControlLabel
        control={<Checkbox checked={checked} />}
        label={
          <>
            {iconPath ? <Icon path={iconPath} size={1} /> : undefined}
            {label ?? undefined}
          </>
        }
        labelPlacement='start'
        onChange={onChange}
      />
    </Tooltip>
  );
}
