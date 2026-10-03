export default function normalizedColorChannelToByte(channel: number) {
  return Math.round(Math.min(Math.max(channel, 0), 1) * 0xff);
}
