import GuiPanelSection from './GuiPanelSection';
import { useCallback, useEffect, useMemo } from 'react';
import {
  downloadTextureFile,
  selectCanExportTextures,
  selectModel,
  selectModels,
  selectObjectMeshIndex,
  selectObjectPolygonIndex,
  selectSceneTextureDefs,
  selectTextureFileName,
  useAppDispatch,
  useAppSelector
} from '@/store';
import GuiPanelButton from './GuiPanelButton';
import GuiPanelTexture from './textures/GuiPanelTexture';
import { Chip, Divider, styled } from '@mui/material';

const Styled = styled('div')(
  ({ theme }) => `
& .MuiDivider-root {
  margin: ${theme.spacing(2)} 0;
}

&.textures {
  display: flex;
  flex-direction: column;
  align-items: center;
}
`
);

export default function GuiPanelViewOptions() {
  const dispatch = useAppDispatch();
  const model = useAppSelector(selectModel);
  const meshIndex = useAppSelector(selectObjectMeshIndex);
  const canExportTextures = useAppSelector(selectCanExportTextures);
  const textureDefs = useAppSelector(selectSceneTextureDefs);
  const textureFileName = useAppSelector(selectTextureFileName);
  const models = useAppSelector(selectModels);

  const selectedMeshTexture: number = useMemo(() => {
    const textureIndex = model?.meshes?.[meshIndex]?.textureIndex;
    return typeof textureIndex === 'number' ? textureIndex : -1;
  }, [model?.meshes?.[meshIndex]?.textureIndex]);

  const polygonIndex = useAppSelector(selectObjectPolygonIndex);

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
              polygonIndex={polygonIndex}
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
            polygonIndex={polygonIndex}
            selected={false}
          />
        );
      }
    }

    return [pTextures, opTextures];
  }, [model, meshIndex, textureDefs, selectedMeshTexture, polygonIndex]);

  return (
    <GuiPanelSection title='Textures' subtitle={textureFileName}>
      <Styled className='textures'>
        {textures}
        {!offsceneTextures.length ? undefined : (
          <>
            {!models.length ? undefined : (
              <Divider flexItem>
                <Chip label='Offscene' size='small' color='secondary' />
              </Divider>
            )}
            {offsceneTextures}
          </>
        )}
      </Styled>
      {canExportTextures ? undefined : (
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
