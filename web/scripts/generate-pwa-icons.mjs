import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const webRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = path.join(webRoot, "public", "pwa");

function iconSvg(size) {
  const radius = Math.round(size * 0.19);
  const fontSize = Math.round(size * 0.55);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0d9488"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${radius}" fill="url(#g)"/>
  <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="${fontSize}">H</text>
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });

for (const size of [192, 512]) {
  const outPath = path.join(outDir, `icon-${size}.png`);
  await sharp(Buffer.from(iconSvg(size))).png().toFile(outPath);
  console.log(`Wrote ${outPath}`);
}
