import {
  selectModel,
  selectModelCount,
  selectModelIndex,
  selectObjectIndex,
  selectObjectSelectionType,
  selectTextureDefs,
  useAppSelector
} from '@/store';
import { Typography, styled } from '@mui/material';
import Image from 'next/image';
import { useMemo, Fragment, useEffect } from 'react';
import clsx from 'clsx';

const Styled = styled('div')(
  ({ theme }) => `
    & {
        position: absolute;
        width: 256px;
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

    & .MuiTypography-root {
      padding-right: ${theme.spacing(2)};
    }

    & > .selection {
      width: 100%;
    }

    & > .textures {
      width: 192px;
      flex-grow: 1;
      overflow-y: auto;
    }

    & > div:not(:last-child) {
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
  const modelIndex = useAppSelector(selectModelIndex);
  const modelCount = useAppSelector(selectModelCount);
  const objectIndex = useAppSelector(selectObjectIndex);
  const objectSelectionType = useAppSelector(selectObjectSelectionType);
  const model = useAppSelector(selectModel);
  const textureDefs = useAppSelector(selectTextureDefs);

  const selectedMeshTexture: number = useMemo(
    () => model?.meshes?.[objectIndex]?.textureNumber || -1,
    [model, objectIndex]
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
      <div className='selection'>
        <Typography variant='h5' textAlign='right'>
          Selection
        </Typography>
        <Typography variant='subtitle1' textAlign='right'>
          Model Count&nbsp;&nbsp;<b>{modelCount}</b>
        </Typography>
        <Typography variant='subtitle1' textAlign='right'>
          Model Index&nbsp;&nbsp;<b>{modelIndex === -1 ? 'N/A' : modelIndex}</b>
        </Typography>
        <Typography variant='subtitle1' textAlign='right'>
          Selection Mode&nbsp;&nbsp;<b>{objectSelectionType}</b>
        </Typography>
        <Typography variant='subtitle1' textAlign='right'>
          Object Index&nbsp;&nbsp;
          <b>{objectIndex === -1 ? 'N/A' : objectIndex}</b>
        </Typography>
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
