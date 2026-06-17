import { useMemo } from 'react';
import { selectModels, selectResourceAttribs } from '@/selectors';
import { useAppSelector } from '@/storeTypings';

export interface TextureModelReference {
  modelIndex: number;
  modelName?: string;
  meshIndexes: number[];
}

export default function useTextureModelReferences(
  textureIndex: number,
  enabled: boolean
) {
  const models = useAppSelector(selectModels);
  const resourceAttribs = useAppSelector(selectResourceAttribs);

  return useMemo<TextureModelReference[]>(() => {
    if (!enabled) {
      return [];
    }

    return models.reduce<TextureModelReference[]>(
      (references, model, modelIndex) => {
        const meshIndexes: number[] = [];

        model.meshes.forEach((mesh, meshIndex) => {
          if (mesh.textureIndex !== textureIndex) {
            return;
          }

          meshIndexes.push(meshIndex);
        });

        if (meshIndexes.length) {
          const modelName = resourceAttribs?.polygonMapped
            ? resourceAttribs.modelHints?.[modelIndex]?.name
            : undefined;

          references.push({
            modelIndex,
            modelName,
            meshIndexes
          });
        }

        return references;
      },
      []
    );
  }, [enabled, models, resourceAttribs, textureIndex]);
}
