// Removes a clean white background from a product photo by flood-filling
// near-white pixels connected to the image border (so interior whites — e.g.
// label text — are preserved), feathers the edge, then autocrops.
//   node scripts/remove-bg.mjs <input> <output>
import Jimp from "jimp";

const [, , inPath, outPath] = process.argv;
if (!inPath || !outPath) {
  console.error("usage: node scripts/remove-bg.mjs <input> <output>");
  process.exit(1);
}

const img = await Jimp.read(inPath);
const { width: w, height: h, data } = img.bitmap;
const minCh = (i) => Math.min(data[i], data[i + 1], data[i + 2]);

const FULL = 244; // min-channel >= this => background white => fully transparent
const EDGE = 214; // min-channel < this => subject => stop flooding
const visited = new Uint8Array(w * h);
const stack = [];
for (let x = 0; x < w; x++) stack.push(x, x + (h - 1) * w);
for (let y = 0; y < h; y++) stack.push(y * w, w - 1 + y * w);

while (stack.length) {
  const p = stack.pop();
  if (p < 0 || p >= w * h || visited[p]) continue;
  visited[p] = 1;
  const i = p * 4;
  const m = minCh(i);
  if (m < EDGE) continue; // reached the subject; do not cross into it
  // brighter (closer to white) => more transparent
  data[i + 3] = m >= FULL ? 0 : Math.max(0, Math.round((255 * (FULL - m)) / (FULL - EDGE)));
  const x = p % w;
  const y = (p / w) | 0;
  if (x + 1 < w) stack.push(p + 1);
  if (x - 1 >= 0) stack.push(p - 1);
  if (y + 1 < h) stack.push(p + w);
  if (y - 1 >= 0) stack.push(p - w);
}

// tight crop to the alpha bounding box (ignore faint stray pixels)
let minX = w, minY = h, maxX = 0, maxY = 0, found = false;
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    if (data[(y * w + x) * 4 + 3] > 40) {
      found = true;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}
if (found) img.crop(minX, minY, maxX - minX + 1, maxY - minY + 1);
await img.writeAsync(outPath);
console.log(`wrote ${outPath} (${img.bitmap.width}x${img.bitmap.height})`);
