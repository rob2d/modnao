const createMockImage = () => ({
  getBase64: async () => 'data:image/png;base64,'
});

module.exports = {
  Jimp: {
    fromBitmap: () => createMockImage(),
    read: async () => createMockImage()
  }
};
