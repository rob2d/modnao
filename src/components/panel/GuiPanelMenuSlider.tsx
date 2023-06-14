import { ListItem, Slider, Typography, styled } from '@mui/material';

const StyledListItem = styled(ListItem)(
  ({ theme }) =>
    `& .MuiSlider-root {
      margin-left: ${theme.spacing(3)};
    }
`
);

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
    <StyledListItem>
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
    </StyledListItem>
  );
}
