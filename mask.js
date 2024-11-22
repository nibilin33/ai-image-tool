const sharp = require('sharp');

async function createMask(inputFile, outputFile, left, top, width, height) {
  const image = sharp(inputFile);
  const { width: imageWidth, height: imageHeight } = await image.metadata();
  console.log(imageWidth, imageHeight)
  if (left < 0 || top < 0 || left + width > imageWidth || top + height > imageHeight) {
    throw new Error('Invalid dimensions for mask');
  }

  await image
    .extract({ left, top, width, height })
    .toFile(outputFile);
}

createMask('./public/ear.png', 'mask.png', 0, 0, 454, 172)
  .then(() => console.log('Mask created'))
  .catch(err => console.error(err));