import { useCallback, useEffect, useState } from 'react';
import { List, ListSubheader } from '@mui/material';
import { useDebounce } from 'use-debounce';
import HslValues from '@/utils/textures/HslValues';
import { adjustTextureHsl, useAppDispatch } from '@/store';
import GuiPanelMenuSlider from '../GuiPanelMenuSlider';

export default function GuiPanelTextureColorOptions({
  textureIndex
}: {
  textureIndex: number;
}) {
  const dispatch = useAppDispatch();
  // @TODO DRY setters
  const [hsl, setHsl] = useState<HslValues>(() => ({
    h: 0,
    s: 0,
    l: 0
  }));

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
    </List>
  );
}
