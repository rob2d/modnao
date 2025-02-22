import { mdiRefresh } from '@mdi/js';
import Icon from '@mdi/react';
import {
  IconButton,
  ListItem,
  Slider,
  styled,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import {
  FocusEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

const StyledListItem = styled(ListItem)(
  ({ theme }) =>
    `
    & {
      display: flex;
      flex-direction: column;
    }

    & .slider {
      display: flex;
      width: 100%;
    }

    & .input-and-reset {
      width: 100%;
      display: flex;
      align-items: center;
      padding-left: ${theme.spacing(3)};
      padding-right: ${theme.spacing(2)};
      justify-content: flex-end;

      & .MuiIconButton-root {
        padding: 0 0;
        margin-left: ${theme.spacing(2)};
      }
    }
    
    & .MuiSlider-root {
      margin-left: ${theme.spacing(2)};
      /* for tooltip popover since there are conflicts in Mui subheaders */
      z-index: 1;
      width: calc(100% - 48px);
    }

    & .MuiTextField-root.input  {
      width: 72px;
    }

    & .MuiTextField-root.input input {
      text-align: right;
      padding: ${theme.spacing(0)} ${theme.spacing(1)};
    }
`
);

type Props = {
  label: string;
  min: number;
  max: number;
  value: number;
  defaultValue: number;
  labelTooltip: string;
  onChange: (value: number) => void;
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
  onChange
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(() => `${value}`);
  useEffect(() => {
    if (value !== Number.parseInt(inputValue)) {
      setInputValue(`${value}`);
    }
  }, [value, inputValue]);

  useEffect(() => {
    if (inputRef.current && inputValue !== inputRef.current.value) {
      inputRef.current.value = inputValue;
    }
  }, [inputValue]);

  const onChangeTextField: FocusEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      let nextValue = Number.parseInt(event.target.value);
      if (!Number.isNaN(nextValue) && nextValue !== value) {
        nextValue = Math.min(max, Math.max(min, nextValue));
        onChange(nextValue);
      }

      setInputValue(event.target.value);
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
    <StyledListItem>
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
          color='secondary'
          size='small'
          type='text'
          slotProps={slotProps}
          className='input'
          onBlur={onChangeTextField}
          inputRef={inputRef}
          inputMode='numeric'
        />
        <IconButton size='small' color='secondary' onClick={onResetValue}>
          <Icon path={mdiRefresh} size={1} />
        </IconButton>
      </div>
    </StyledListItem>
  );
}
