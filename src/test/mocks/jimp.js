class MockJimp {
  static fromBitmap = () => new MockJimp();

  getBase64 = async () => 'data:image/png;base64,';
}

module.exports = {
  Jimp: MockJimp
};
