import type { NLUITextureDef } from '@/types';
import type { TextureColorFormat } from '../TextureColorFormat';
import createTextureDef from '../createTextureDef';

const SECTOR_SIZE = 0x800;
const PAC_DATA_BASE_OFFSET = 0x800;
const PAC_ENTRY_TABLE_OFFSET = 0x10;
const PAC_ENTRY_BYTE_LENGTH = 8;
const PAC_STREAM_OFFSET_WORD_LOCATION = 0x0c;

const GBIX_HEADER_BYTE_LENGTH = 8;
const PVRT_HEADER_BYTE_LENGTH = 16;

const PVR_TEXTURE_FORMAT_TWIDDLED = 0x01;
const PVR_TEXTURE_KINDS = new Set([0x0b, 0x0c]);

interface PvrColorFormatInfo {
  colorFormat: TextureColorFormat;
  colorFormatValue: number;
}

const pvrColorFormatInfoByValue = new Map<number, PvrColorFormatInfo>([
  [0x00, { colorFormat: 'ARGB1555', colorFormatValue: 0 }],
  [0x01, { colorFormat: 'RGB565', colorFormatValue: 1 }],
  [0x02, { colorFormat: 'ARGB4444', colorFormatValue: 2 }]
]);

const alignUp = (value: number, alignment: number) =>
  Math.ceil(value / alignment) * alignment;

const hasMagic = (buffer: Buffer, offset: number, magic: string) =>
  buffer.subarray(offset, offset + magic.length).toString('ascii') === magic;

export default function parseSfa3PacTextureDefs(
  buffer: Buffer,
  textureShapesMap: NLUITextureDef[] = []
): NLUITextureDef[] {
  const entryCount = buffer.readUInt32LE(0);
  const textureDefs: NLUITextureDef[] = [];
  let streamOffset = alignUp(
    PAC_DATA_BASE_OFFSET + buffer.readUInt32LE(PAC_STREAM_OFFSET_WORD_LOCATION),
    SECTOR_SIZE
  );

  for (let entryIndex = 0; entryIndex < entryCount; entryIndex += 1) {
    const entryOffset =
      PAC_ENTRY_TABLE_OFFSET + entryIndex * PAC_ENTRY_BYTE_LENGTH;
    const textureKind = buffer.readUInt8(entryOffset + 1);
    const chunkByteLength = buffer.readUInt32LE(entryOffset + 4);

    if (chunkByteLength === 0) {
      continue;
    }

    const isTextureChunk = PVR_TEXTURE_KINDS.has(textureKind);
    if (!isTextureChunk) {
      streamOffset = alignUp(streamOffset + chunkByteLength, SECTOR_SIZE);
      continue;
    }

    if (!hasMagic(buffer, streamOffset, 'GBIX')) {
      throw new Error('SFA3 PAC texture chunk missing GBIX header');
    }

    const gbixDataByteLength = buffer.readUInt32LE(streamOffset + 4);
    const pvrtOffset =
      streamOffset + GBIX_HEADER_BYTE_LENGTH + gbixDataByteLength;

    if (!hasMagic(buffer, pvrtOffset, 'PVRT')) {
      throw new Error('SFA3 PAC texture chunk missing PVRT header');
    }

    const colorFormatValue = buffer.readUInt8(pvrtOffset + 8);
    const textureFormatValue = buffer.readUInt8(pvrtOffset + 9);
    const width = buffer.readUInt16LE(pvrtOffset + 12);
    const height = buffer.readUInt16LE(pvrtOffset + 14);
    const colorFormatInfo = pvrColorFormatInfoByValue.get(colorFormatValue);

    if (textureFormatValue === PVR_TEXTURE_FORMAT_TWIDDLED && colorFormatInfo) {
      const textureShape = textureShapesMap[textureDefs.length];

      textureDefs.push(
        createTextureDef({
          width: textureShape?.width ?? width,
          height: textureShape?.height ?? height,
          colorFormat: colorFormatInfo.colorFormat,
          colorFormatValue: colorFormatInfo.colorFormatValue,
          displayedAspectRatio: textureShape?.displayedAspectRatio,
          flipX: true,
          baseLocation: pvrtOffset + PVRT_HEADER_BYTE_LENGTH
        })
      );
    }

    streamOffset = alignUp(streamOffset + chunkByteLength, SECTOR_SIZE);
  }

  return textureDefs;
}
