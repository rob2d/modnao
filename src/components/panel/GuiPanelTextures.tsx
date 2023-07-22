import GuiPanelSection from './GuiPanelSection';
import { useCallback, useEffect, useMemo } from 'react';
import {
  downloadTextureFile,
  selectHasCompressedTextures,
  selectHasLoadedTextureFile,
  selectModel,
  selectObjectKey,
  selectObjectMeshIndex,
  selectSceneTextureDefs,
  selectTextureFileName,
  useAppDispatch,
  useAppSelector
} from '@/store';
import GuiPanelButton from './GuiPanelButton';
import GuiPanelTexture from './textures/GuiPanelTexture';

export default function GuiPanelViewOptions() {
  const dispatch = useAppDispatch();
  const model = useAppSelector(selectModel);
  const meshIndex = useAppSelector(selectObjectMeshIndex);
  const hasCompressedTextures = useAppSelector(selectHasCompressedTextures);
  const textureDefs = useAppSelector(selectSceneTextureDefs);
  const objectKey = useAppSelector(selectObjectKey);
  const textureFileName = useAppSelector(selectTextureFileName);

  const selectedMeshTexture: number = useMemo(() => {
    const textureIndex = model?.meshes?.[meshIndex]?.textureIndex;

    return typeof textureIndex === 'number' ? textureIndex : -1;
  }, [model, objectKey, meshIndex]);

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

  const textures = useMemo(() => {
    const images: JSX.Element[] = [];
    const textureSet = new Set<number>();

    (model?.meshes || []).forEach((m, i) => {
      if (!textureSet.has(m.textureIndex) && textureDefs?.[m.textureIndex]) {
        textureSet.add(m.textureIndex);
        const textureDef = textureDefs?.[m.textureIndex];

        images.push(
          <GuiPanelTexture
            key={`${m.textureIndex}_${i}`}
            textureDef={textureDef}
            textureIndex={m.textureIndex}
            textureSize={m.textureSize}
            selected={selectedMeshTexture === m.textureIndex}
          />
        );
      }
    });

    return images;
  }, [model, textureDefs, selectedMeshTexture]);

  return (
    <GuiPanelSection title='Textures' subtitle={textureFileName}>
      <div className='textures'>{textures}</div>
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
