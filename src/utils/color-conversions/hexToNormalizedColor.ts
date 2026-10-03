export default function hexToNormalizedColor(
  hexColor: string
): NLColor | undefined {
  const hex = hexColor.replace(/^#/, '');

  if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
    return undefined;
  }

  return [
    parseInt(hex.slice(0, 2), 16) / 0xff,
    parseInt(hex.slice(2, 4), 16) / 0xff,
    parseInt(hex.slice(4, 6), 16) / 0xff
  ];
}
