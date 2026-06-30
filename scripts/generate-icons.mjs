// Generate PWA icons. Run once after install:
//   npm install -D sharp && node scripts/generate-icons.mjs
import sharp from "sharp";
import { mkdirSync } from "fs";

mkdirSync("public/icons", { recursive: true });

// Emerald rounded square with a centered lucide "wallet" glyph (vector, no emoji).
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#10b981"/>
  <g transform="translate(128 128) scale(10.6667)" fill="none" stroke="#ffffff"
     stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/>
    <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>
  </g>
</svg>`;

const buf = Buffer.from(svg);

await sharp(buf).resize(192, 192).png().toFile("public/icons/icon-192.png");
await sharp(buf).resize(512, 512).png().toFile("public/icons/icon-512.png");
await sharp(buf).resize(180, 180).png().toFile("public/icons/apple-touch-icon.png");

console.log("Icons generated.");
