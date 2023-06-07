const PIXEL_SIZE = 2;

export default function decompressTextureBuffer(buffer: Buffer) {
  const output: number[] = [];
  let useBitmask = true;

  let bitmask = 0b0;
  let pixelsBackCount = 0;
  let pixelsGrabbedCount = 0;
  let extraPixelCount: number;

  let chunk = 0;
  let i = 0;

  while (i < buffer.length / PIXEL_SIZE) {
    let value = buffer.readUInt16LE(i * PIXEL_SIZE);
    i++;

    if (useBitmask) {
      bitmask = value;
      useBitmask = false;
      continue;
    }

    // reset this to be diffed on each loop
    extraPixelCount = 0;
    const isCompressed = (bitmask & (0x8000 >> chunk)) != 0;
    if (isCompressed) {
      if (value === 0) {
        break;
      }

      // advance 4 bytes
      if ((value & 0x07ff) === value) {
        pixelsBackCount = value;

        pixelsGrabbedCount = buffer.readUInt16LE(i + 1);
        value = (value << 16) | pixelsGrabbedCount;
        i += 1;
      }
      // advance 2 bytes
      else {
        pixelsGrabbedCount = value & (0xf800 >> 11);
        pixelsBackCount = value & 0x07ff;
      }

      if (pixelsBackCount < pixelsGrabbedCount) {
        extraPixelCount = pixelsGrabbedCount - pixelsBackCount;
        pixelsGrabbedCount = pixelsBackCount;
      }

      const offset = i - PIXEL_SIZE * pixelsBackCount;
      const nextOutput = [];
      for (let j = 0; j < pixelsGrabbedCount; j++) {
        nextOutput.push(output[offset + j]);
      }

      for (let j = 0; j < pixelsGrabbedCount + extraPixelCount; j++) {
        output.push(nextOutput[j % nextOutput.length]);
      }
    }

    if (!isCompressed) {
      output.push(value);
    }

    chunk += 1;

    if (chunk == 0x10) {
      chunk = 0;
      useBitmask = true;
    }
  }

  return Buffer.from(new Uint16Array(output));
}
