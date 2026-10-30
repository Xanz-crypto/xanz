import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

// Helper to write minimal PNG files using pure Node.js built-ins
function createPng(width, height, getPixelRgba) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth 8
  ihdr.writeUInt8(6, 9); // color type 6: RGBA
  ihdr.writeUInt8(0, 10); // compression method 0
  ihdr.writeUInt8(0, 11); // filter method 0
  ihdr.writeUInt8(0, 12); // interlace method 0

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw image data with filter byte 0 at start of each scanline
  const scanlineLength = width * 4 + 1;
  const rawData = Buffer.alloc(height * scanlineLength);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixelRgba(x, y, width, height);
      const pixelOffset = rowOffset + 1 + x * 4;
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);

  const crc = Buffer.alloc(4);
  crc.writeInt32BE(crc32(body), 0);

  return Buffer.concat([length, body, crc]);
}

// Standard CRC32 implementation
const crcTable = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) {
      c = 0xedb88320 ^ (c >>> 1);
    } else {
      c = c >>> 1;
    }
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return crc ^ -1;
}

// Generator for XA Optimizer Icon (Cybernetic Red/Rose Shield with Lightning Bolt)
function renderIconPixel(x, y, width, height, isMaskable = false) {
  const cx = width / 2;
  const cy = height / 2;
  const dx = (x - cx) / (width / 2);
  const dy = (y - cy) / (height / 2);
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Background dark cybernetic gradient
  const bgR = Math.round(9 + Math.max(0, 15 * (1 - dist)));
  const bgG = Math.round(10 + Math.max(0, 10 * (1 - dist)));
  const bgB = Math.round(15 + Math.max(0, 20 * (1 - dist)));

  // If maskable, fill the entire square canvas with dark cyber background
  // If not maskable, round corners smoothly
  if (!isMaskable && dist > 0.98) {
    return [0, 0, 0, 0]; // Transparent outer edge
  }

  // Scale coordinates inside icon
  const scale = isMaskable ? 0.72 : 0.85;
  const px = dx / scale;
  const py = dy / scale;

  // Hexagonal shield shape test
  // |px| * 0.866 + |py| * 0.5 <= 0.85 and |px| <= 0.78
  const isInsideShield = (Math.abs(px) * 0.866 + (py + 0.1) * 0.5 <= 0.82) &&
                         (Math.abs(px) <= 0.75) &&
                         (py >= -0.75) &&
                         (py <= 0.85 - Math.abs(px) * 0.7);

  // Outer glowing shield border
  const borderDist = Math.max(
    Math.abs(px) * 0.866 + (py + 0.1) * 0.5 - 0.78,
    Math.abs(px) - 0.72
  );

  let r = bgR;
  let g = bgG;
  let b = bgB;
  let a = 255;

  if (isInsideShield) {
    // Shield fill: deep crimson/rose dark gradient
    const shieldGrad = (py + 0.7) / 1.5;
    r = Math.round(225 * (1 - shieldGrad * 0.6) + 30 * shieldGrad);
    g = Math.round(29 * (1 - shieldGrad * 0.8) + 15 * shieldGrad);
    b = Math.round(72 * (1 - shieldGrad * 0.8) + 35 * shieldGrad);

    // Glowing shield border
    if (borderDist > -0.07) {
      r = 255;
      g = 75;
      b = 110;
    }

    // Lightning bolt in center
    // Approximate lightning polygon:
    // top right (0.15, -0.45) -> center left (-0.25, 0.0) -> mid (-0.02, 0.0) -> bottom right (0.1, 0.5) -> center right (0.05, 0.08) -> back
    const boltPoints = [
      [0.15, -0.48],
      [-0.18, 0.0],
      [0.02, 0.0],
      [-0.12, 0.5],
      [0.22, -0.02],
      [0.03, -0.02],
    ];

    // Simple point in polygon or shape match for bolt
    let inBolt = false;
    // Check upper triangle: (0.15, -0.48) to (-0.18, 0.0) to (0.05, 0.0)
    // Check lower triangle: (0.02, 0.0) to (-0.12, 0.5) to (0.22, -0.02)
    if (py >= -0.48 && py <= 0.0) {
      const t = (py - (-0.48)) / 0.48;
      const leftEdge = 0.15 - t * 0.33;
      const rightEdge = 0.18 - t * 0.13;
      if (px >= leftEdge - 0.08 && px <= rightEdge + 0.04) {
        inBolt = true;
      }
    } else if (py > 0.0 && py <= 0.5) {
      const t = py / 0.5;
      const leftEdge = -0.12 * t + (0.02 * (1 - t));
      const rightEdge = 0.05 * (1 - t) + (0.15 * (1 - t));
      if (px >= leftEdge - 0.06 && px <= rightEdge + 0.12) {
        inBolt = true;
      }
    }

    if (inBolt) {
      // Neon cyan / electric white bolt
      r = 240;
      g = 255;
      b = 255;
    }
  } else if (borderDist < 0.04 && borderDist > -0.08 && py >= -0.8 && py <= 0.9) {
    // Outer subtle cyan/rose neon aura
    r = Math.round(244 * 0.7);
    g = Math.round(63 * 0.4);
    b = Math.round(94 * 0.8);
  }

  return [r, g, b, a];
}

// Generate files
const publicDir = path.resolve('public');
const wellKnownDir = path.join(publicDir, '.well-known');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
if (!fs.existsSync(wellKnownDir)) fs.mkdirSync(wellKnownDir, { recursive: true });

// 1. pwa-192x192.png
const png192 = createPng(192, 192, (x, y, w, h) => renderIconPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), png192);

// 2. pwa-512x512.png
const png512 = createPng(512, 512, (x, y, w, h) => renderIconPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), png512);

// 3. pwa-maskable-512x512.png
const pngMaskable512 = createPng(512, 512, (x, y, w, h) => renderIconPixel(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pngMaskable512);

// 4. apple-touch-icon.png (180x180)
const appleIcon = createPng(180, 180, (x, y, w, h) => renderIconPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleIcon);

// 5. favicon.ico
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPng(48, 48, (x, y, w, h) => renderIconPixel(x, y, w, h, false)));

// 6. icon.svg
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f111a" />
      <stop offset="100%" stop-color="#050608" />
    </linearGradient>
    <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f43f5e" />
      <stop offset="50%" stop-color="#e11d48" />
      <stop offset="100%" stop-color="#881337" />
    </linearGradient>
    <linearGradient id="boltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="50%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#a5f3fc" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  <rect width="512" height="512" rx="110" fill="url(#bgGrad)" />
  <rect width="504" height="504" x="4" y="4" rx="106" stroke="#f43f5e" stroke-width="3" stroke-opacity="0.3" fill="none" />
  
  <!-- Outer Shield Aura -->
  <polygon points="256,60 410,135 385,340 256,445 127,340 102,135" fill="none" stroke="#f43f5e" stroke-width="8" stroke-dasharray="16 8" opacity="0.6" />
  
  <!-- Main Shield -->
  <polygon points="256,76 394,144 370,328 256,422 142,328 118,144" fill="url(#shieldGrad)" filter="url(#glow)" />
  
  <!-- Inner Shield Core -->
  <polygon points="256,98 370,154 350,310 256,390 162,310 142,154" fill="#0b0d14" fill-opacity="0.92" stroke="#f43f5e" stroke-width="2" />
  
  <!-- Speed lines -->
  <path d="M170 190 H342 M185 220 H327 M200 250 H312" stroke="#38bdf8" stroke-opacity="0.18" stroke-width="2" stroke-linecap="round" />

  <!-- Lightning Bolt -->
  <path d="M276 130 L195 258 H254 L224 372 L320 236 H260 L292 130 Z" fill="url(#boltGrad)" filter="url(#glow)" />

  <!-- Badge Text -->
  <text x="256" y="468" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-size="24" font-weight="bold" letter-spacing="4">XA OPTIMIZER</text>
</svg>`;
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgIcon);

// 7. Digital Asset Links for Google Play Store Trusted Web Activity (TWA)
const assetlinks = [
  {
    relation: ["delegate_permission/common.handle_all_urls"],
    target: {
      namespace: "android_app",
      package_name: "com.xa.optimizer.gaming",
      sha256_cert_fingerprints: [
        "14:6D:E9:D6:0F:7B:D1:72:3B:86:14:04:78:EF:52:1B:04:6E:8B:19:71:59:7C:12:E6:6E:06:40:F7:3F:5E:0A"
      ]
    }
  }
];
fs.writeFileSync(path.join(wellKnownDir, 'assetlinks.json'), JSON.stringify(assetlinks, null, 2));

console.log('Successfully generated all PWA icons & assetlinks.json!');
