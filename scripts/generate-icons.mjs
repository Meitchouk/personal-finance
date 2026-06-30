// Run this once to generate PWA icons:
// node scripts/generate-icons.mjs
// Requires: npm install -D sharp

import sharp from "sharp";
import { mkdirSync } from "fs";

mkdirSync("public/icons", { recursive: true });

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="80" fill="#10b981"/>
  <text x="256" y="340" font-size="280" text-anchor="middle" fill="white">💰</text>
</svg>`;

const buf = Buffer.from(svg);

await sharp(buf).resize(192, 192).png().toFile("public/icons/icon-192.png");
await sharp(buf).resize(512, 512).png().toFile("public/icons/icon-512.png");
await sharp(buf).resize(180, 180).png().toFile("public/icons/apple-touch-icon.png");

console.log("Icons generated!");
