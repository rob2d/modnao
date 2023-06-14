import { List } from '@mui/material';
import GuiPanelMenuSlider from '../GuiPanelMenuSlider';
import { useCallback, useState } from 'react';

export default function GuiPanelTextureHSLEditor() {
  // @TODO DRY setters
  const [h, setH] = useState(() => 0);
  const [s, setS] = useState(() => 0);
  const [l, setL] = useState(() => 0);

  const onSetH = useCallback(
    (_: Event, h: number | number[]) => setH(Array.isArray(h) ? h[0] : h),
    []
  );
  const onSetS = useCallback(
    (_: Event, s: number | number[]) => setS(Array.isArray(s) ? s[0] : s),
    []
  );
  const onSetL = useCallback(
    (_: Event, l: number | number[]) => setL(Array.isArray(l) ? l[0] : l),
    []
  );

  return (
    <List dense className={'hsv-sliders'}>
      <GuiPanelMenuSlider
        label={'H'}
        min={-180}
        max={180}
        value={h}
        onChange={onSetH}
      />
      <GuiPanelMenuSlider
        label={'S'}
        min={-180}
        max={180}
        value={s}
        onChange={onSetS}
      />
      <GuiPanelMenuSlider
        label={'L'}
        min={-100}
        max={100}
        value={l}
        onChange={onSetL}
      />
    </List>
  );
}
