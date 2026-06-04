// Processes the 18 high-quality bottle-pop frames into a web-ready sequence for
// the scroll-scrub hero.
//   SRC: C:/Users/loren/Pictures/brasilena/foto alta qualita/frame/{1..18}.png  (6912x3456, white bg)
//   OUT: public/images/brasilena/pop-1..18.webp  (uniform crop, edges flattened to hero yellow)
// Steps: (1) find the union content bbox across all frames (so every frame shares
// the same crop and the bottle stays put), (2) per frame: crop -> resize -> remove
// the white studio bg by flood-filling near-white pixels connected to the border
// (interior highlights/label preserved) -> erode the 1px anti-alias ring -> FLATTEN
// onto the hero yellow (#ffcc00) so there is NO white contour on the yellow hero.
import sharp from "sharp";

const SRC = "C:/Users/loren/Pictures/brasilena/foto alta qualita/frame/";
const OUT = "public/images/brasilena/";
const N = 18;
const TARGET_W = 1600;            // output width of the union-bbox crop
const PAD = 0.015;                // 1.5% padding around content
const CONTENT = 232;              // min-channel below this = content (for bbox)
const FULL = 242, EDGE = 205;     // flood-fill: >=FULL transparent, <EDGE = subject
const YELLOW = { r: 255, g: 204, b: 0 }; // --brasilena-yellow (hero bg)

const meta0 = await sharp(SRC + "1.png").metadata();
const OW = meta0.width, OH = meta0.height;

// ---- Pass 1: union content bbox (scan downscaled frames) ----
const SCAN_W = 720;
const scale = OW / SCAN_W;
let minX = SCAN_W, minY = 1e9, maxX = 0, maxY = 0;
for (let n = 1; n <= N; n++) {
  const { data, info } = await sharp(SRC + n + ".png").resize({ width: SCAN_W }).raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height, ch = info.channels;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * ch;
      const mn = Math.min(data[i], data[i + 1], data[i + 2]);
      if (mn < CONTENT) {
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
}
const padX = (maxX - minX) * PAD, padY = (maxY - minY) * PAD;
const L = Math.max(0, Math.floor((minX - padX) * scale));
const T = Math.max(0, Math.floor((minY - padY) * scale));
const R = Math.min(OW, Math.ceil((maxX + padX) * scale));
const B = Math.min(OH, Math.ceil((maxY + padY) * scale));
const cropW = R - L, cropH = B - T;
const TARGET_H = Math.round((cropH / cropW) * TARGET_W);
console.log(`union bbox (orig): ${cropW}x${cropH} at ${L},${T} -> out ${TARGET_W}x${TARGET_H}`);

// ---- Pass 2: per frame crop -> resize -> flood-fill de-bg -> erode -> flatten on yellow ----
for (let n = 1; n <= N; n++) {
  const { data, info } = await sharp(SRC + n + ".png")
    .extract({ left: L, top: T, width: cropW, height: cropH })
    .resize(TARGET_W, TARGET_H, { fit: "fill" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;
  const minCh = (i) => Math.min(data[i], data[i + 1], data[i + 2]);

  // flood-fill the border-connected white background -> alpha
  const visited = new Uint8Array(w * h);
  const stack = [];
  for (let x = 0; x < w; x++) { stack.push(x, x + (h - 1) * w); }
  for (let y = 0; y < h; y++) { stack.push(y * w, w - 1 + y * w); }
  while (stack.length) {
    const p = stack.pop();
    if (p < 0 || p >= w * h || visited[p]) continue;
    visited[p] = 1;
    const i = p * 4;
    const m = minCh(i);
    if (m < EDGE) continue;
    data[i + 3] = m >= FULL ? 0 : Math.max(0, Math.round((255 * (FULL - m)) / (FULL - EDGE)));
    const x = p % w, y = (p / w) | 0;
    if (x + 1 < w) stack.push(p + 1);
    if (x - 1 >= 0) stack.push(p - 1);
    if (y + 1 < h) stack.push(p + w);
    if (y - 1 >= 0) stack.push(p - w);
  }

  // erode alpha 1px (3x3 min) to shave the white anti-alias ring
  const a1 = new Uint8Array(w * h);
  for (let p = 0; p < w * h; p++) a1[p] = data[p * 4 + 3];
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let mn = a1[y * w + x];
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx, ny = y + dy;
          const v = nx < 0 || ny < 0 || nx >= w || ny >= h ? 0 : a1[ny * w + nx];
          if (v < mn) mn = v;
        }
      data[(y * w + x) * 4 + 3] = mn;
    }

  // flatten onto hero yellow -> opaque, no white contour on the yellow hero
  await sharp(Buffer.from(data), { raw: { width: w, height: h, channels: 4 } })
    .flatten({ background: YELLOW })
    .webp({ quality: 90, effort: 4 })
    .toFile(`${OUT}pop-${n}.webp`);
  process.stdout.write(`pop-${n} `);
}
console.log(`\ndone: ${N} frames @ ${TARGET_W}x${TARGET_H} (flattened on yellow)`);
