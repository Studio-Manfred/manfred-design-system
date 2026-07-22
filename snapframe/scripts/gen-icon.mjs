// Generates the Snapframe app icon set as PNGs — a rounded gradient square with
// a soft "framed" inner card — without any native image dependencies. It encodes
// raw RGBA pixels into valid PNG files using Node's built-in zlib.
//
// Usage: node scripts/gen-icon.mjs
// For a distributable build, also run: npm run tauri icon app-icon.png
//   (that produces icon.icns / icon.ico from the 1024px source below).

import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const iconsDir = join(root, "src-tauri", "icons");
mkdirSync(iconsDir, { recursive: true });

function lerp(a, b, t) {
  return Math.round(a + (b - a) * t);
}

// Gradient endpoints match the app's "Dusk" preset.
const C0 = [0x45, 0x68, 0xdc];
const C1 = [0xb0, 0x6a, 0xb3];

function draw(size) {
  const buf = Buffer.alloc(size * size * 4);
  const r = size * 0.22; // corner radius
  const card = { x: size * 0.26, y: size * 0.3, w: size * 0.48, h: size * 0.4, r: size * 0.06 };

  const inRoundRect = (px, py, x, y, w, h, rad) => {
    const cx = Math.min(Math.max(px, x + rad), x + w - rad);
    const cy = Math.min(Math.max(py, y + rad), y + h - rad);
    const dx = px - cx;
    const dy = py - cy;
    if (px < x || px > x + w || py < y || py > y + h) return false;
    return dx * dx + dy * dy <= rad * rad || px >= x + rad && px <= x + w - rad || py >= y + rad && py <= y + h - rad;
  };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      // Outer rounded square mask (diagonal gradient).
      const inside = inRoundRect(x, y, 0, 0, size, size, r);
      const t = (x + y) / (2 * size);
      let rr = lerp(C0[0], C1[0], t);
      let gg = lerp(C0[1], C1[1], t);
      let bb = lerp(C0[2], C1[2], t);
      let aa = inside ? 255 : 0;

      // Inner white "screenshot card" with a subtle shadow.
      if (inRoundRect(x, y, card.x, card.y, card.w, card.h, card.r)) {
        rr = 244;
        gg = 246;
        bb = 250;
      }
      buf[i] = rr;
      buf[i + 1] = gg;
      buf[i + 2] = bb;
      buf[i + 3] = aa;
    }
  }
  return buf;
}

// --- Minimal PNG encoder (truecolour + alpha, 8-bit) ---
function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
  }
  return (~c) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePng(rgba, size) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type RGBA
  // Each scanline prefixed with filter byte 0.
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const outputs = [
  ["32x32.png", 32],
  ["128x128.png", 128],
  ["128x128@2x.png", 256],
  ["icon.png", 512],
  ["Square150x150Logo.png", 150],
  ["StoreLogo.png", 512],
];

for (const [name, size] of outputs) {
  writeFileSync(join(iconsDir, name), encodePng(draw(size), size));
}
// 1024px source for `tauri icon`.
writeFileSync(join(root, "app-icon.png"), encodePng(draw(1024), 1024));

console.log(`Wrote ${outputs.length} PNG icons to src-tauri/icons/ and app-icon.png`);
