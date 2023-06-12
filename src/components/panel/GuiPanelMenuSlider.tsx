import { ListItem, Slider, Typography } from '@mui/material';

type Props = {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (event: Event, value: number | number[]) => void;
};

/**
 * abstraction for controlled slider in a panel menu
 * @param param0
 * @returns
 */
export default function GuiPanelMenuSlider({
  min,
  max,
  value,
  label,
  onChange
}: Props) {
  return (
    <ListItem>
      <Typography variant='body1'>{label}</Typography>
      <Slider
        size='small'
        min={min}
        max={max}
        aria-label={label}
        valueLabelDisplay='auto'
        color='secondary'
        className='MuiMenuItem-gutters'
        value={value}
        onChange={onChange}
      />
    </ListItem>
  );
}
