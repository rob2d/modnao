import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Box,
  IconButton,
  ListItem,
  Slider,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
import { SystemStyleObject } from '@mui/system';
import {
  FocusEventHandler,
  ReactNode,
  useCallback,
  useMemo,
  useRef
} from 'react';

type Props = {
  label: string;
  min: number;
  max: number;
  value: number;
  defaultValue: number;
  labelTooltip: string;
  onChange: (value: number) => void;
  additionalControls?: ReactNode;
  labelSx?: SystemStyleObject<Theme>;
  inputSx?: SystemStyleObject<Theme>;
  sx?: SxProps<Theme>;
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
  additionalControls,
  labelSx,
  inputSx,
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
    <Box
      sx={{
        ...sx,
        px: 2,
        mt: 1,
        mb: 0.5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          alignItems: 'center'
        }}
      >
        <Tooltip title={labelTooltip} placement='left'>
          <Typography variant='body1' sx={labelSx}>
            {label}
          </Typography>
        </Tooltip>
        <Slider
          size='small'
          min={min}
          max={max}
          aria-label={label}
          valueLabelDisplay='auto'
          color='secondary'
          value={value}
          onChange={onChangeSlider}
          sx={{
            ml: 2,
            zIndex: 1,
            py: 0,
            '& .MuiSlider-thumb': {
              width: 12,
              height: 12
            }
          }}
        />
      </Box>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          px: 3,
          justifyContent: 'flex-end'
        }}
      >
        <TextField
          key={value}
          color='secondary'
          size='small'
          type='text'
          defaultValue={value}
          slotProps={slotProps}
          onBlur={onChangeTextField}
          inputRef={inputRef}
          inputMode='numeric'
          sx={{
            width: 72,
            '& input': {
              textAlign: 'right',
              py: 0,
              px: 1
            },
            ...inputSx
          }}
        />
        <IconButton
          size='small'
          color='secondary'
          onClick={onResetValue}
          aria-label={`Reset ${label}`}
          sx={{ p: 0, ml: 2 }}
        >
          <RefreshIcon fontSize='small' />
        </IconButton>
        {!additionalControls ? null : (
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 2, gap: 1 }}>
            {additionalControls}
          </Box>
        )}
      </Box>
    </Box>
  );
}
