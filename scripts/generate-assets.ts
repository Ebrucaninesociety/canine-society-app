/**
 * Generate Expo's required asset PNGs from a single SVG source.
 *
 * Outputs to ./assets/:
 *   - icon.png            1024x1024  (iOS app icon)
 *   - adaptive-icon.png   1024x1024  (Android adaptive icon foreground)
 *   - splash.png          1242x2436  (Splash screen background image)
 *   - favicon.png         48x48      (Web favicon if we ever ship web)
 *
 * Run: npx tsx scripts/generate-assets.ts
 */

import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const SAND = '#F3E8D4';
const DEEP_OCEAN = '#172451';

const ASSETS_DIR = path.join(process.cwd(), 'assets');

// Icon: solid Sand with a centred Bodoni-style "C·S" mark in Deep Ocean.
// No rounded corners. iOS will apply its system mask; Android shows raw.
function iconSvg(size: number): string {
  const fontSize = size * 0.42;
  const labelSize = size * 0.07;
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="${SAND}"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
      font-family="'Bodoni Moda', 'Bodoni 72', 'Didot', 'Times New Roman', serif"
      font-weight="400" font-size="${fontSize}"
      fill="${DEEP_OCEAN}">
      CS
    </text>
    <text x="50%" y="${size * 0.84}" text-anchor="middle"
      font-family="'DM Sans', 'Helvetica Neue', sans-serif"
      font-weight="500" font-size="${labelSize}" letter-spacing="${labelSize * 0.18}"
      fill="${DEEP_OCEAN}">
      ROMA · DACH
    </text>
  </svg>`;
}

// Splash: same mark, taller canvas, wordmark on two lines.
function splashSvg(width: number, height: number): string {
  const display = Math.min(width, height) * 0.16;
  const label = Math.min(width, height) * 0.025;
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="${SAND}"/>
    <text x="50%" y="${height * 0.32}" text-anchor="middle"
      font-family="'DM Sans', sans-serif"
      font-weight="500" font-size="${label}" letter-spacing="${label * 0.22}"
      fill="${DEEP_OCEAN}">
      ROMA · DACH
    </text>
    <text x="50%" y="${height * 0.46}" text-anchor="middle"
      font-family="'Bodoni Moda', 'Didot', 'Times New Roman', serif"
      font-weight="400" font-size="${display}"
      fill="${DEEP_OCEAN}">
      CANINE
    </text>
    <text x="50%" y="${height * 0.54}" text-anchor="middle"
      font-family="'Bodoni Moda', 'Didot', 'Times New Roman', serif"
      font-weight="400" font-size="${display}"
      fill="${DEEP_OCEAN}">
      SOCIETY
    </text>
  </svg>`;
}

async function render(svg: string, outPath: string): Promise<void> {
  await sharp(Buffer.from(svg)).png().toFile(outPath);
  console.log('  →', path.relative(process.cwd(), outPath));
}

async function main() {
  await mkdir(ASSETS_DIR, { recursive: true });
  console.log('Rendering assets to', ASSETS_DIR);
  await render(iconSvg(1024), path.join(ASSETS_DIR, 'icon.png'));
  await render(iconSvg(1024), path.join(ASSETS_DIR, 'adaptive-icon.png'));
  await render(splashSvg(1242, 2436), path.join(ASSETS_DIR, 'splash.png'));
  await render(iconSvg(48), path.join(ASSETS_DIR, 'favicon.png'));
  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
