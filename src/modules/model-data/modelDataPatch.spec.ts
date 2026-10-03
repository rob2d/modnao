import {
  $hasEditedTextures,
  $models,
  $originalModels,
  $polygonBufferKey,
  $polygonFileName,
  $resourceAttribs,
  $textureDefs,
  $textureHistory,
  resetModelData
} from '@/modules/model-data/modelDataStore';
import O from '@/constants/StructOffsets';
import {
  $modelIndex,
  $textureIndex
} from '@/modules/object-viewer/objectViewerStore';
import type { ResourceAttribs } from '@/types';
import globalBuffers from '@/utils/data/globalBuffers';
import { createTextureDef } from '@/utils/textures';
import { Image } from 'image-js';
import JSZip from 'jszip';
import loadModelDataPatch from './loadModelDataPatch';
import {
  createModelDataPatchManifest,
  default as parseModelDataPatchManifest
} from './parseModelDataPatchManifest';
import validateModelDataPatchCompatibility, {
  getModelDataPatchPrefix,
  getModelDataPatchTarget
} from './validateModelDataPatchCompatibility';

describe('modelDataPatch', () => {
  const resourceAttribs: ResourceAttribs = {
    game: 'MVC2',
    name: 'Desert Stage (Orange Sky)',
    identifier: '0x01',
    resourceType: 'mvc2-stage',
    filenamePattern: 'STG01',
    oobReferencable: false,
    textureFileType: 'mvc2-stage-preview',
    hasLzssTextureFile: false,
    polygonMapped: true
  };

  const createManifest = () =>
    createModelDataPatchManifest({
      resourcePrefix: 'stg01',
      target: getModelDataPatchTarget(resourceAttribs),
      entries: [
        {
          type: 'v-color',
          entry: [0, 0, 0, 0, [1, 0.5, 0, 0.25]]
        }
      ],
      textures: [
        {
          textureIndex: 0,
          imagePath: 'stg01.mn.0.png',
          width: 1,
          height: 1
        }
      ]
    });

  afterEach(() => {
    globalBuffers.clear();
  });

  it('generates and parses a versioned combined manifest', () => {
    const manifest = createManifest();

    expect(manifest.formatVersion).toBe(2);
    expect(manifest.entries).toEqual([
      {
        type: 'v-color',
        entry: [0, 0, 0, 0, [1, 0.5, 0, 0.25]]
      }
    ]);
    expect(manifest).not.toHaveProperty('vertexColors');
    expect(parseModelDataPatchManifest(JSON.stringify(manifest))).toEqual(
      manifest
    );
  });

  it('rejects invalid extensions and JSON', () => {
    expect(() => getModelDataPatchPrefix('stg01.zip')).toThrow('.mnp.zip');
    expect(() => parseModelDataPatchManifest('{')).toThrow('damaged');
  });

  it('rejects a patch for a different loaded resource', () => {
    const manifest = createManifest();

    expect(() =>
      validateModelDataPatchCompatibility(manifest, {
        ...resourceAttribs,
        name: 'Factory Stage',
        identifier: '0x02'
      })
    ).toThrow(
      'This patch is for Marvel vs Capcom 2: Desert Stage (Orange Sky), but Marvel vs Capcom 2: Factory Stage is currently open.'
    );
  });

  it('loads a compatible patch archive for the active polygon resource', async () => {
    const manifest = createManifest();
    const zip = new JSZip();
    zip.file('stg01.mnp.json', JSON.stringify(manifest));
    const texturePixels = new Uint8Array([255, 128, 0, 64]);
    const textureImage = new Image(1, 1, texturePixels, {
      components: 3,
      alpha: 1
    });
    zip.file('stg01.mn.0.png', textureImage.toBuffer({ format: 'png' }));
    const zipBuffer: ArrayBuffer = await zip.generateAsync({
      type: 'arraybuffer'
    });
    const file = new File([zipBuffer], 'stg01.psychadelic-dark.mnp.zip');
    resetModelData();
    const contentAddress = 16;
    const createVertex = (): NLVertex => ({
      address: contentAddress,
      index: 0,
      position: [0, 0, 0],
      normals: [0, 0, 0],
      addressingMode: 'direct',
      contentModeValue: 0,
      vertexOffset: 0,
      contentAddress,
      uv: [0, 0],
      colors: [0, 0, 0, 1]
    });
    const createModel = (): NLModel => ({
      address: 0,
      ramAddress: 0,
      position: [0, 0, 0],
      radius: 0,
      mainBounds: {
        min: [0, 0, 0],
        max: [0, 0, 0],
        center: [0, 0, 0],
        size: [0, 0, 0],
        vertexCount: 2,
        totalVertexCount: 2
      },
      totalVertexCount: 2,
      meshes: [
        {
          address: 0,
          baseParams: 0,
          textureInstructions: 0,
          polygons: [
            {
              address: 0,
              flags: {
                culling: false,
                cullingType: 'back',
                spriteQuad: false,
                strip: false,
                triangles: true,
                superVertexIndex: false,
                gouradShading: false,
                reuseGlobalParams: false,
                envMaps: false
              },
              vertices: [createVertex(), createVertex()],
              vertexCount: 2,
              indices: [],
              triIndices: [],
              actualVertexCount: 2,
              vertexGroupModeValue: 0,
              vertexGroupMode: 'regular'
            }
          ],
          position: [0, 0, 0],
          color: [0, 0, 0],
          alpha: 1,
          specularColor: [0, 0, 0],
          specularAlpha: 1,
          polygonDataLength: 0,
          textureWrappingValue: 0,
          textureWrappingFlags: {
            hFlip: false,
            vFlip: false,
            hRepeat: false,
            vRepeat: false,
            hStretch: false
          },
          textureControlValue: 0,
          isOpaque: true,
          vertexColorModeValue: 1,
          hasColoredVertices: true,
          textureColorFormat: 'ARGB1555',
          textureColorFormatValue: 0,
          textureIndex: 0,
          textureSizeValue: 0,
          textureSize: [8, 8]
        }
      ]
    });
    const models = [createModel()];
    const originalModels = [createModel()];
    const polygonBufferKey = globalBuffers.add(new Uint8Array(64));
    const originalTranslucentBufferKey = globalBuffers.add(
      new Uint8Array([0, 0, 0, 0])
    );
    const originalOpaqueBufferKey = globalBuffers.add(
      new Uint8Array([0, 0, 0, 255])
    );
    const textureDefs = [
      createTextureDef({
        width: 1,
        height: 1,
        bufferKeys: {
          translucent: originalTranslucentBufferKey,
          opaque: originalOpaqueBufferKey
        }
      })
    ];

    $models.value = models;
    $originalModels.value = originalModels;
    $textureDefs.value = textureDefs;
    $polygonFileName.value = 'STG01POL.BIN';
    $polygonBufferKey.value = polygonBufferKey;
    $resourceAttribs.value = resourceAttribs;

    $modelIndex.value = 0;
    $textureIndex.value = 0;

    const result = await loadModelDataPatch(file);
    const colorOffset = contentAddress + O.Vertex.COLORS;

    expect(result).toBeDefined();
    expect($models.value[0].meshes[0].polygons[0].vertices[0].colors).toEqual([
      1, 0.5, 0, 0.25
    ]);
    expect($models.value[0].meshes[0].polygons[0].vertices[1].colors).toEqual([
      1, 0.5, 0, 0.25
    ]);
    expect($originalModels.value).toEqual(originalModels);
    expect(
      Array.from(
        globalBuffers.get(polygonBufferKey).slice(colorOffset, colorOffset + 4)
      )
    ).toEqual([0, 128, 255, 64]);
    expect(
      Array.from(
        globalBuffers.get($textureDefs.value[0].bufferKeys.translucent ?? '')
      )
    ).toEqual(Array.from(texturePixels));
    expect(
      Array.from(
        globalBuffers.get($textureDefs.value[0].bufferKeys.opaque ?? '')
      )
    ).toEqual([255, 128, 0, 255]);
    expect($textureHistory.value[0]).toEqual([
      {
        bufferKeys: {
          translucent: originalTranslucentBufferKey,
          opaque: originalOpaqueBufferKey
        }
      }
    ]);
    expect($hasEditedTextures.value).toBe(true);
  });
});
