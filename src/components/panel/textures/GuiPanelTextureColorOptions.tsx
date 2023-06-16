import { useCallback, useEffect, useState } from 'react';
import { Button, List, ListItem, ListSubheader, styled } from '@mui/material';
import { useDebounce } from 'use-debounce';
import HslValues from '@/utils/textures/HslValues';
import { adjustTextureHsl, useAppDispatch } from '@/store';
import GuiPanelMenuSlider from '../GuiPanelMenuSlider';
import Icon from '@mdi/react';
import { mdiRefresh } from '@mdi/js';

const StyledButton = styled(Button)(
  ({ theme }) =>
    `& svg {
    margin-right: ${theme.spacing(1)};
  }`
);

const DEFAULT_HSL = {
  h: 0,
  s: 0,
  l: 0
};

export default function GuiPanelTextureColorOptions({
  textureIndex
}: {
  textureIndex: number;
}) {
  const dispatch = useAppDispatch();
  // @TODO DRY setters
  const [hsl, setHsl] = useState<HslValues>(() => DEFAULT_HSL);

  const onSetH = useCallback(
    (_: Event, v: number | number[]) =>
      setHsl({
        ...hsl,
        h: Array.isArray(v) ? v[0] : v
      }),
    [hsl]
  );

  const onSetS = useCallback(
    (_: Event, v: number | number[]) =>
      setHsl({
        ...hsl,
        s: Array.isArray(v) ? v[0] : v
      }),
    [hsl]
  );

  const onSetL = useCallback(
    (_: Event, v: number | number[]) =>
      setHsl({
        ...hsl,
        l: Array.isArray(v) ? v[0] : v
      }),
    [hsl]
  );

  const [debouncedHsl] = useDebounce(hsl, 100);

  useEffect(() => {
    dispatch(adjustTextureHsl({ hsl: debouncedHsl, textureIndex }));
  }, [debouncedHsl]);

  const onResetValues = useCallback(() => setHsl(DEFAULT_HSL), [setHsl]);

  const hasChanges =
    DEFAULT_HSL.h !== hsl.h ||
    DEFAULT_HSL.s !== hsl.s ||
    DEFAULT_HSL.l !== hsl.l;

  return (
    <List
      dense
      className={'hsv-sliders'}
      subheader={
        <ListSubheader component='div' id='nested-list-subheader'>
          Color Adjustment
        </ListSubheader>
      }
    >
      <GuiPanelMenuSlider
        label={'H'}
        min={-180}
        max={180}
        value={hsl.h}
        onChange={onSetH}
      />
      <GuiPanelMenuSlider
        label={'S'}
        min={-100}
        max={100}
        value={hsl.s}
        onChange={onSetS}
      />
      <GuiPanelMenuSlider
        label={'L'}
        min={-50}
        max={50}
        value={hsl.l}
        onChange={onSetL}
      />
      {!hasChanges ? undefined : (
        <ListItem>
          <StyledButton
            onClick={onResetValues}
            color='secondary'
            size='small'
            variant='outlined'
            fullWidth
          >
            <Icon path={mdiRefresh} size={1} />
            RESET
          </StyledButton>
        </ListItem>
      )}
    </List>
  );
}
