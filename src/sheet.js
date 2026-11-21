import { PNG } from 'pngjs';

const toBuffer = (value) => (Buffer.isBuffer(value) ? value : Buffer.from(value, 'base64'));

export function makeContactSheet(images, { columns = 3, tileWidth = 480, background = [11, 14, 20] } = {}) {
  if (!images.length) return null;
  const decoded = images.map((image) => PNG.sync.read(toBuffer(image)));
  const sourceWidth = decoded[0].width;
  const sourceHeight = decoded[0].height;
  const tileHeight = Math.round((sourceHeight * tileWidth) / sourceWidth);
  const rows = Math.ceil(decoded.length / columns);
  const sheet = new PNG({ width: columns * tileWidth, height: rows * tileHeight });

  for (let i = 0; i < sheet.data.length; i += 4) {
    sheet.data[i] = background[0];
    sheet.data[i + 1] = background[1];
    sheet.data[i + 2] = background[2];
    sheet.data[i + 3] = 255;
  }

  decoded.forEach((source, index) => {
    const originX = (index % columns) * tileWidth;
    const originY = Math.floor(index / columns) * tileHeight;
    for (let y = 0; y < tileHeight; y += 1) {
      const sy = Math.min(source.height - 1, Math.floor((y * source.height) / tileHeight));
      for (let x = 0; x < tileWidth; x += 1) {
        const sx = Math.min(source.width - 1, Math.floor((x * source.width) / tileWidth));
        const from = (sy * source.width + sx) * 4;
        const to = ((originY + y) * sheet.width + originX + x) * 4;
        sheet.data[to] = source.data[from];
        sheet.data[to + 1] = source.data[from + 1];
        sheet.data[to + 2] = source.data[from + 2];
        sheet.data[to + 3] = 255;
      }
    }
  });

  return PNG.sync.write(sheet).toString('base64');
}
