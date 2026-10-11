import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

export function comparePng(before, after) {
  const a = PNG.sync.read(before),
    b = PNG.sync.read(after);
  const width = Math.max(a.width, b.width),
    height = Math.max(a.height, b.height);
  if (width * height > 1440 * 8000) throw new Error('pageSize');
  const pad = (image) => {
    const out = new PNG({ width, height });
    out.data.fill(255);
    PNG.bitblt(image, out, 0, 0, image.width, image.height, 0, 0);
    return out;
  };
  const aa = pad(a),
    bb = pad(b),
    diff = new PNG({ width, height });
  pixelmatch(aa.data, bb.data, diff.data, width, height, {
    threshold: 0.1,
    includeAA: false,
    diffMask: true,
    diffColor: [255, 81, 47],
  });
  let changedPixels = 0,
    resizedPixels = 0;
  // White added/removed page area is a real size change, even if pixelmatch sees white.
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * 4;
      if ((x < a.width && y < a.height) !== (x < b.width && y < b.height)) {
        diff.data.set([255, 81, 47, 255], offset);
        resizedPixels++;
      }
      if (diff.data[offset + 3]) changedPixels++;
    }
  return {
    width,
    height,
    changedPixels,
    resizedPixels,
    ratio: changedPixels / (width * height),
    image: PNG.sync.write(diff),
  };
}
