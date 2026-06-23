/** 生成 PWA 所需的 PNG 图标（纯色圆角方块风格） */
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

function generateIcon(size) {
  // 原始 RGBA 像素数据：深紫背景 + 白色 QR 方块图案
  const pixels = Buffer.alloc(size * size * 4);
  const bg = [0x1C, 0x1C, 0x1E, 0xFF]; // #1C1C1E
  const fg = [0x7B, 0x7C, 0xFF, 0xFF]; // #7B7CFF
  const white = [0xFF, 0xFF, 0xFF, 0xFF];

  const margin = Math.floor(size * 0.15);
  const inner = size - margin * 2;
  const block = Math.floor(inner / 7);

  // 填充背景
  for (let i = 0; i < size * size; i++) {
    pixels[i * 4] = bg[0];
    pixels[i * 4 + 1] = bg[1];
    pixels[i * 4 + 2] = bg[2];
    pixels[i * 4 + 3] = bg[3];
  }

  // 绘制中心 QR 图标（简化：中心方块 + 角标）
  function fillRect(x, y, w, h, color) {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const px = x + dx;
        const py = y + dy;
        if (px >= 0 && px < size && py >= 0 && py < size) {
          const idx = (py * size + px) * 4;
          pixels[idx] = color[0];
          pixels[idx + 1] = color[1];
          pixels[idx + 2] = color[2];
          pixels[idx + 3] = color[3];
        }
      }
    }
  }

  // 三个角标（Finder 图案简化表示）
  const corner = Math.floor(margin + block * 0.5);
  const cornerSize = block * 2;
  // 左上
  fillRect(corner, corner, cornerSize, cornerSize, fg);
  fillRect(corner + Math.floor(block * 0.5), corner + Math.floor(block * 0.5), block, block, white);
  // 右上
  fillRect(size - corner - cornerSize, corner, cornerSize, cornerSize, fg);
  fillRect(size - corner - cornerSize + Math.floor(block * 0.5), corner + Math.floor(block * 0.5), block, block, white);
  // 左下
  fillRect(corner, size - corner - cornerSize, cornerSize, cornerSize, fg);
  fillRect(corner + Math.floor(block * 0.5), size - corner - cornerSize + Math.floor(block * 0.5), block, block, white);

  // 构建 PNG
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);  // width
  ihdr.writeUInt32BE(size, 4);  // height
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 6;   // color type: RGBA
  ihdr[10] = 0;  // compression
  ihdr[11] = 0;  // filter
  ihdr[12] = 0;  // interlace
  const ihdrChunk = createChunk('IHDR', ihdr);

  // IDAT - raw data with filter byte 0 per row
  const rawData = Buffer.alloc(size * (1 + size * 4));
  for (let y = 0; y < size; y++) {
    rawData[y * (1 + size * 4)] = 0; // filter: none
    pixels.copy(rawData, y * (1 + size * 4) + 1, y * size * 4, (y + 1) * size * 4);
  }
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);

  // IEND
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// 生成图标
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);

[192, 512].forEach((size) => {
  const png = generateIcon(size);
  fs.writeFileSync(path.join(publicDir, `pwa-${size}x${size}.png`), png);
  console.log(`✓ pwa-${size}x${size}.png`);
});
