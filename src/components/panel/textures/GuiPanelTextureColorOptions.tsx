import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import {
  Button,
  List,
  ListItem,
  ListSubheader,
  Tooltip,
  styled
} from '@mui/material';
import { useDebounce } from 'use-debounce';
import HslValues from '@/utils/textures/HslValues';
import {
  adjustTextureHsl,
  selectEditedTextures,
  selectTextureDefs,
  useAppDispatch,
  useAppSelector
} from '@/store';
import GuiPanelMenuSlider from '../GuiPanelMenuSlider';
import Icon from '@mdi/react';
import { mdiRefresh } from '@mdi/js';
import { batch } from 'react-redux';

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
  const textureDefs = useAppSelector(selectTextureDefs);
  const editedTextures = useAppSelector(selectEditedTextures);
  const [hsl, setHsl] = useState<HslValues>(() => {
    if (!editedTextures[textureIndex]?.hsl) {
      return DEFAULT_HSL;
    }

    const { h, s, l } = editedTextures[textureIndex].hsl;
    return h || s || l ? editedTextures[textureIndex].hsl : DEFAULT_HSL;
  });
  const getHslSetter = useCallback(
    (key: keyof HslValues) => (_: Event, v: number | number[]) =>
      setHsl({
        ...DEFAULT_HSL,
        ...hsl,
        [key]: Array.isArray(v) ? v[0] : v
      }),
    [hsl]
  );

  const onSetH = getHslSetter('h');
  const onSetS = getHslSetter('s');
  const onSetL = getHslSetter('l');

  const [debouncedHsl] = useDebounce(hsl, 50);

  useEffect(() => {
    dispatch(adjustTextureHsl({ hsl: debouncedHsl, textureIndex }));
  }, [debouncedHsl]);

  const onResetValues = useCallback(() => setHsl(DEFAULT_HSL), [setHsl]);

  const onApplyToAll = useCallback(() => {
    batch(() => {
      for (
        let textureIndex = 0;
        textureIndex < textureDefs.length;
        textureIndex++
      ) {
        dispatch(adjustTextureHsl({ hsl, textureIndex }));
      }
    });
  }, [hsl, textureIndex]);

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
        min={-100}
        max={100}
        value={hsl.l}
        onChange={onSetL}
      />
      {!hasChanges ? undefined : (
        <ListItem>
          <Tooltip
            title='Reset color changes to this texture'
            placement='left-start'
          >
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
          </Tooltip>
        </ListItem>
      )}
      {!hasChanges ? undefined : (
        <ListItem>
          <Tooltip
            title='Apply color changes to all loaded textures'
            placement='left-start'
          >
            <StyledButton
              onClick={onApplyToAll}
              color='secondary'
              size='small'
              variant='outlined'
              fullWidth
            >
              APPLY TO ALL
            </StyledButton>
          </Tooltip>
        </ListItem>
      )}
    </List>
  );
}
