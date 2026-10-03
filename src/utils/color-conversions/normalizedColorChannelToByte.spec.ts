import normalizedColorChannelToByte from './normalizedColorChannelToByte';

describe('normalizedColorChannelToByte', () => {
  it('converts normalized channels to rounded bytes', () => {
    expect(normalizedColorChannelToByte(0)).toBe(0);
    expect(normalizedColorChannelToByte(0.5)).toBe(128);
    expect(normalizedColorChannelToByte(1)).toBe(255);
  });

  it('clamps channels outside the normalized range', () => {
    expect(normalizedColorChannelToByte(-0.5)).toBe(0);
    expect(normalizedColorChannelToByte(1.5)).toBe(255);
  });
});
