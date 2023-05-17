import {
  selectMeshDisplayMode,
  selectModel,
  selectModelCount,
  selectModelIndex,
  selectObjectIndex,
  selectObjectSelectionType,
  selectTextureDefs,
  setMeshDisplayMode,
  setObjectType,
  useAppDispatch,
  useAppSelector
} from '@/store';
import {
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  styled
} from '@mui/material';
import Image from 'next/image';
import { useMemo, Fragment, useEffect, useCallback } from 'react';
import clsx from 'clsx';

const Styled = styled('div')(
  ({ theme }) => `
    & {
        position: absolute;
        width: 208px;
        top: 0;
        right: 0;
        display: flex;
        flex-direction: column; 
        align-items: flex-end;
        max-height: 100vh;
        box-sizing: border-box;
        padding-top: ${theme.spacing(2)};
        padding-bottom: ${theme.spacing(12)};
    }

    & .MuiToggleButtonGroup-root {
      margin-top: ${theme.spacing(1)};
      margin-bottom: ${theme.spacing(1)};
    }

    & > .MuiTypography-h5 {
      padding-right: ${theme.spacing(2)};
    }

    & > .selection {
      display: flex;
      flex-direction: column;
      align-items: end;
      width: 100%;    
    }

    & > .selection > * {
        padding-right: ${theme.spacing(2)};
    }

    & .property-table > *:nth-child(odd) {
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }

    & .property-table > *:nth-child(even) {
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }

    & > .textures {
      width: 192px;
      flex-grow: 1;
      overflow-y: auto;
    }

    & > .textures > .MuiTypography-root {
      padding-right: ${theme.spacing(2)}
    }

    & > :not(:last-child) {
      margin-bottom: ${theme.spacing(2)}
    }

    & > .textures img {
      width: 100%;
      height: auto;
      border-color: ${theme.palette.secondary.main};
      border-width: 1px;
      border-style: solid;
      opacity: 1.0;
      transition: opacity 0.35s ease;
    }

    & > .textures img.deemphasized {
      filter: saturate(0.25);
      opacity: 0.25;
    }

    & > .textures img:not(:last-child) {
      margin-bottom: ${theme.spacing(1)}
    }
  `
);

export default function DebugInfoPanel() {
  const dispatch = useAppDispatch();
  const modelIndex = useAppSelector(selectModelIndex);
  const modelCount = useAppSelector(selectModelCount);
  const objectIndex = useAppSelector(selectObjectIndex);
  const objectSelectionType = useAppSelector(selectObjectSelectionType);
  const meshDisplayMode = useAppSelector(selectMeshDisplayMode);
  const model = useAppSelector(selectModel);
  const textureDefs = useAppSelector(selectTextureDefs);

  const selectedMeshTexture: number = useMemo(
    () => model?.meshes?.[objectIndex]?.textureNumber || -1,
    [model, objectIndex]
  );

  const onSetObjectSelectionType = useCallback(
    (_: React.MouseEvent<HTMLElement>, type: any) => {
      type && dispatch(setObjectType(type));
    },
    []
  );

  const onSetMeshDisplayMode = useCallback(
    (_: React.MouseEvent<HTMLElement>, mode: any) => {
      mode && dispatch(setMeshDisplayMode(mode));
    },
    []
  );

  const textures = useMemo(() => {
    const images: JSX.Element[] = [];
    const textureSet = new Set<number>();

    (model?.meshes || []).forEach((m, i) => {
      if (!textureSet.has(m.textureNumber) && textureDefs?.[m.textureNumber]) {
        textureSet.add(m.textureNumber);

        const isDeemphasized = !(
          selectedMeshTexture === -1 || selectedMeshTexture === m.textureNumber
        );

        const [, width, height] = m.textureSize.match(/([0-9]+)x([0-9]+)/) as [
          unknown,
          number,
          number
        ];
        const tDef = textureDefs?.[m.textureNumber];

        images.push(
          <Fragment key={`${i}_${m.textureNumber}`}>
            <Typography variant='subtitle2' textAlign='right'>
              {m.textureSize} [index {m.textureNumber}]
            </Typography>
            <a
              href={tDef.dataUrl}
              title='View this texture in a new tab'
              target='_parent'
            >
              <Image
                src={tDef.dataUrl}
                id={`debug-panel-t-${m.textureNumber}`}
                alt={`Mesh # ${i}, Texture # ${m.textureNumber}`}
                width={Number(width)}
                height={Number(height)}
                className={clsx(isDeemphasized && 'deemphasized')}
              />
            </a>
          </Fragment>
        );
      }
    });

    return images;
  }, [model, textureDefs, selectedMeshTexture]);

  // when selecting a texture, scroll to the item
  useEffect(() => {
    const textureEl = document.getElementById(
      `debug-panel-t-${selectedMeshTexture}`
    );

    if (textureEl) {
      textureEl.scrollIntoView({ behavior: 'smooth' });
    }
  }, [textureDefs, selectedMeshTexture]);

  return (
    <Styled>
      <Typography variant='h5' textAlign='right'>
        Selection
      </Typography>
      <div className='selection'>
        <Grid container className={'property-table'}>
          <Grid xs={6}>
            <Typography variant='body2' textAlign='right'>
              Model Count
            </Typography>
          </Grid>
          <Grid xs={6}>
            <Typography variant='button' textAlign='right'>
              {modelCount}
            </Typography>
          </Grid>
          <Grid xs={6}>
            <Typography variant='body2' textAlign='right'>
              Model Index
            </Typography>
          </Grid>
          <Grid xs={6}>
            <Typography variant='button' textAlign='right'>
              {modelIndex === -1 ? 'N/A' : modelIndex}
            </Typography>
          </Grid>
          <Grid xs={8}>
            <Typography variant='body2' textAlign='right'>
              Object Index
            </Typography>
          </Grid>
          <Grid xs={4}>
            <Typography variant='button' textAlign='right'>
              {objectIndex === -1 ? 'N/A' : objectIndex}
            </Typography>
          </Grid>
          <Grid xs={6}>
            <Typography variant='body2' textAlign='right'>
              Selection Type
            </Typography>
          </Grid>
          <Grid xs={6}>
            <ToggleButtonGroup
              orientation='vertical'
              color='secondary'
              value={objectSelectionType}
              size='small'
              exclusive
              onChange={onSetObjectSelectionType}
              aria-label='text alignment'
              disabled
            >
              <ToggleButton value='mesh'>mesh</ToggleButton>
              <ToggleButton value='polygon'>polygon</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          <Grid xs={6}>
            <Typography variant='body2' textAlign='right'>
              Mesh Display
            </Typography>
          </Grid>
          <Grid xs={6}>
            <ToggleButtonGroup
              orientation='vertical'
              size='small'
              color='secondary'
              value={meshDisplayMode}
              exclusive
              onChange={onSetMeshDisplayMode}
              aria-label='Mesh Display Mode Selection'
            >
              <ToggleButton value='wireframe'>wireframe</ToggleButton>
              <ToggleButton value='textured'>textured</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
      </div>
      <Typography variant='h5' textAlign='right'>
        Textures
      </Typography>
      <div className='textures'>
        {textures.length ? (
          textures
        ) : (
          <Typography variant='subtitle1' textAlign='right'>
            N/A
          </Typography>
        )}
      </div>
    </Styled>
  );
}
