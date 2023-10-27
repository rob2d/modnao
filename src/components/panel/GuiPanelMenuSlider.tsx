import { ListItem, Slider, styled, Tooltip, Typography } from '@mui/material';

const StyledListItem = styled(ListItem)(
  ({ theme }) =>
    `& .MuiSlider-root {
      margin-left: ${theme.spacing(3)};
      /* for tooltip popover since there are conflicts in Mui subheaders */
      z-index: 1;
    }
`
);

type Props = {
  label: string;
  min: number;
  max: number;
  value: number;
  labelTooltip: string;
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
  labelTooltip,
  onChange
}: Props) {
  return (
    <StyledListItem>
      <Tooltip title={labelTooltip} placement='left'>
        <Typography variant='body1'>{label}</Typography>
      </Tooltip>
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
