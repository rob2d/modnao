import GuiPanelSection from './GuiPanelSection';
import { useCallback, useEffect, useMemo } from 'react';
import {
  downloadTextureFile,
  selectHasCompressedTextures,
  selectModel,
  selectObjectMeshIndex,
  selectSceneTextureDefs,
  selectTextureFileName,
  useAppDispatch,
  useAppSelector
} from '@/store';
import GuiPanelButton from './GuiPanelButton';
import GuiPanelTexture from './textures/GuiPanelTexture';
import { Chip, Divider, styled } from '@mui/material';

const StyledDivider = styled(Divider)(
  ({ theme }) => `
& {
  margin: ${theme.spacing(2)} 0;
}
`
);

export default function GuiPanelViewOptions() {
  const dispatch = useAppDispatch();
  const model = useAppSelector(selectModel);
  const meshIndex = useAppSelector(selectObjectMeshIndex);
  const hasCompressedTextures = useAppSelector(selectHasCompressedTextures);
  const textureDefs = useAppSelector(selectSceneTextureDefs);
  const textureFileName = useAppSelector(selectTextureFileName);

  const selectedMeshTexture: number = useMemo(() => {
    const textureIndex = model?.meshes?.[meshIndex]?.textureIndex;
    return typeof textureIndex === 'number' ? textureIndex : -1;
  }, [model?.meshes?.[meshIndex]?.textureIndex]);

  // when selecting a texture, scroll to the item
  useEffect(() => {
    const textureEl = document.getElementById(
      `gui-panel-t-${selectedMeshTexture}`
    );

    if (textureEl) {
      textureEl.scrollIntoView({ behavior: 'smooth' });
    }
  }, [textureDefs && selectedMeshTexture]);

  const onExportTextureFile = useCallback(() => {
    dispatch(downloadTextureFile());
  }, [dispatch]);

  const [textures, offsceneTextures] = useMemo(() => {
    const pTextures: JSX.Element[] = [];
    const opTextures: JSX.Element[] = [];
    const textureSet = new Set<number>();
    /** set of textureIndexes that are offscene */
    [...(model?.meshes || [])]
      .sort((m1, m2) => (m1.textureIndex || 0) - (m2.textureIndex || 0))
      .forEach((m, i) => {
        const textureDef = textureDefs?.[m.textureIndex];
        if (!textureDef) {
          return;
        }
        if (!textureSet.has(m.textureIndex)) {
          textureSet.add(m.textureIndex);
          const textureDef = textureDefs?.[m.textureIndex];

          pTextures.push(
            <GuiPanelTexture
              key={`${m.textureIndex}_${i}`}
              textureDef={textureDef}
              textureIndex={m.textureIndex}
              selected={selectedMeshTexture === m.textureIndex}
            />
          );
        }
      });

    for (let i = 0; i < textureDefs.length; i++) {
      const textureDef = textureDefs?.[i];
      if (!textureDef) {
        continue;
      }

      if (!textureSet.has(i)) {
        opTextures.push(
          <GuiPanelTexture
            key={i}
            textureDef={textureDef}
            textureIndex={i}
            selected={false}
          />
        );
      }
    }

    return [pTextures, opTextures];
  }, [model, meshIndex, textureDefs, selectedMeshTexture]);

  return (
    <GuiPanelSection title='Textures' subtitle={textureFileName}>
      <div className='textures'>
        {textures}
        <StyledDivider flexItem>
          <Chip label='Offscene' size='small' color='secondary' />
        </StyledDivider>
        {offsceneTextures}
      </div>
      {hasCompressedTextures ? undefined : (
        <div className='export-texture-button-container'>
          <GuiPanelButton
            tooltip='Download texture ROM binary with replaced images'
            onClick={onExportTextureFile}
            color='secondary'
          >
            Export Textures
          </GuiPanelButton>
        </div>
      )}
    </GuiPanelSection>
  );
}
