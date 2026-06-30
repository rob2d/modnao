import RefreshIcon from '@mui/icons-material/Refresh';
import {
  BoxProps,
  IconButton,
  ListItem,
  Slider,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { FocusEventHandler, useCallback, useMemo, useRef } from 'react';

type Props = {
  label: string;
  min: number;
  max: number;
  value: number;
  defaultValue: number;
  labelTooltip: string;
  onChange: (value: number) => void;
  sx?: BoxProps['sx'];
};

/**
 * abstraction for controlled slider along with a text field to represent a number
 * @returns
 */
export default function NumericSliderInput({
  min,
  max,
  defaultValue,
  value,
  label,
  labelTooltip,
  onChange,
  sx
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const onChangeTextField: FocusEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      let nextValue = Number.parseInt(event.target.value);

      if (!Number.isNaN(nextValue) && nextValue !== value) {
        nextValue = Math.min(max, Math.max(min, nextValue));
        onChange(nextValue);
      }

      if (inputRef.current) {
        inputRef.current.value = `${Number.isNaN(nextValue) ? value : nextValue}`;
      }
    },
    [onChange, value, min, max]
  );

  const onChangeSlider = useCallback((_: Event, value: number | number[]) => {
    if (Array.isArray(value)) {
      onChange(value[0]);
    } else {
      onChange(value);
    }
  }, []);

  const onResetValue = useCallback(() => {
    onChange(defaultValue);
  }, [defaultValue]);

  const slotProps = useMemo(
    () => ({ input: { type: 'number', min, max } }),
    [min, max]
  );

  return (
    <ListItem
      sx={{
        ...sx,
        display: 'flex',
        flexDirection: 'column',
        '& .slider': {
          display: 'flex',
          width: '100%'
        },
        '& .input-and-reset': {
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          pl: 3,
          pr: 2,
          justifyContent: 'flex-end',
          '& .MuiIconButton-root': {
            p: 0,
            ml: 2
          }
        },
        '& .MuiSlider-root': {
          ml: 2,
          zIndex: 1,
          width: 'calc(100% - 48px)'
        },
        '& .MuiTextField-root.input': {
          width: '72px'
        },
        '& .MuiTextField-root.input input': {
          textAlign: 'right',
          py: 0,
          px: 1
        }
      }}
    >
      <div className='slider'>
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
          onChange={onChangeSlider}
        />
      </div>
      <div className='input-and-reset'>
        <TextField
          key={value}
          color='secondary'
          size='small'
          type='text'
          defaultValue={value}
          slotProps={slotProps}
          className='input'
          onBlur={onChangeTextField}
          inputRef={inputRef}
          inputMode='numeric'
        />
        <IconButton size='small' color='secondary' onClick={onResetValue}>
          <RefreshIcon fontSize='small' />
        </IconButton>
      </div>
    </ListItem>
  );
}
