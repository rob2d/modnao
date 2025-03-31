import { JSX, useCallback, useEffect, useMemo } from 'react';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import JSZip from 'jszip';
import {
  downloadTextureFile,
  selectCanExportTextures,
  selectContentViewMode,
  selectHasLoadedTextureFile,
  selectLoadTexturesState,
  selectModel,
  selectModels,
  selectObjectMeshIndex,
  selectObjectPolygonIndex,
  selectSelectedTexture,
  selectTextureFileName,
  selectUpdatedTextureDefs,
  useAppDispatch,
  useAppSelector
} from '@/store';
import { createB64ImgFromTextureDef } from '@/utils/textures';
import GuiPanelButton from './GuiPanelButton';
import GuiPanelTexture from './textures/GuiPanelTexture';
import { Chip, Divider, styled } from '@mui/material';
import GuiPanelSection from './GuiPanelSection';

const Styled = styled('div')(
  ({ theme }) => `
& .MuiDivider-root {
  margin: ${theme.spacing(2)} 0;
}

& {
  display: block;
  text-align: left;
}
`
);

export default function GuiPanelViewOptions() {
  const dispatch = useAppDispatch();
  const model = useAppSelector(selectModel);
  const meshIndex = useAppSelector(selectObjectMeshIndex);
  const canExportTextures = useAppSelector(selectCanExportTextures);
  const textureDefs = useAppSelector(selectUpdatedTextureDefs);
  const textureFileName = useAppSelector(selectTextureFileName);
  const selectedTexture = useAppSelector(selectSelectedTexture);
  const contentViewMode = useAppSelector(selectContentViewMode);
  const loadTexturesState = useAppSelector(selectLoadTexturesState);
  const hasLoadedTextureFile = useAppSelector(selectHasLoadedTextureFile);
  const models = useAppSelector(selectModels);

  const polygonIndex = useAppSelector(selectObjectPolygonIndex);

  // when selecting a texture, scroll to the item
  useEffect(() => {
    const textureEl = document.getElementById(`gui-panel-t-${selectedTexture}`);

    if (textureEl) {
      textureEl.scrollIntoView({ behavior: 'smooth' });
    }
  }, [textureDefs && selectedTexture]);

  const onExportTextureFile = useCallback(() => {
    dispatch(downloadTextureFile());
  }, [dispatch]);

  const onDownloadAllTextureImgs = useCallback(() => {
    const zip = new JSZip();

    const imgPromises = textureDefs.map((textureDef) => {
      const base64 = createB64ImgFromTextureDef({
        textureDef,
        asTranslucent: false
      }).then((str) => str.replace(/^data:image\/(png|jpeg);base64,/, ''));

      return base64;
    });

    Promise.all(imgPromises)
      .then((base64Imgs) => {
        base64Imgs.forEach((img, i) => {
          const filename = `${textureFileName?.replace(/.([a-zA-Z0-9]+)$/, '')}.mn.${i}.png`;
          zip.file(filename, img, { base64: true });
        });

        return zip.generateAsync({ type: 'blob' });
      })
      .then((zipContent) => {
        const filename = `${textureFileName?.replace(/.([a-zA-Z0-9]+)$/, '')}.`;
        saveAs(
          zipContent,
          `${filename}mn.${dayjs().format('YYMMDDHHmmss')}.zip`
        );
      });
  }, [dispatch, textureDefs, textureFileName]);

  const [textures, offsceneTextures] = useMemo(() => {
    if (loadTexturesState === 'pending') {
      return [
        Array(10)
          .fill(0)
          .map((_, i) => (
            <GuiPanelTexture
              key={i}
              textureDef={undefined}
              textureIndex={undefined}
              polygonIndex={undefined}
              selected={undefined}
              contentViewMode={undefined}
            />
          )),
        []
      ];
    }
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
              selected={selectedTexture === m.textureIndex}
              contentViewMode={contentViewMode}
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
            selected={i === selectedTexture}
            contentViewMode={contentViewMode}
          />
        );
      }
    }

    return [pTextures, opTextures];
  }, [
    model,
    meshIndex,
    textureDefs,
    selectedTexture,
    polygonIndex,
    contentViewMode,
    loadTexturesState
  ]);

  return (
    <GuiPanelSection
      title={`Textures ${
        hasLoadedTextureFile ? ` (${textureDefs.length})` : ''
      }`}
      subtitle={textureFileName}
      subtitleLoadingState={loadTexturesState}
    >
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
      <div className='texture-export-options'>
        {!canExportTextures ? undefined : (
          <div className='export-texture-button-container'>
            <GuiPanelButton
              tooltip='Download texture ROM binary with replaced images'
              onClick={onExportTextureFile}
              color='primary'
            >
              Export Textures
            </GuiPanelButton>
          </div>
        )}
        <div className='export-texture-images'>
          <GuiPanelButton
            tooltip='Download all available textures as images in a zip file'
            onClick={onDownloadAllTextureImgs}
            color='secondary'
          >
            Download All Images
          </GuiPanelButton>
        </div>
      </div>
    </GuiPanelSection>
  );
}
