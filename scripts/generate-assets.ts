/**
 * Generate Expo's required asset PNGs from a single SVG source.
 * Matches the production website at caninesociety.com: white surface,
 * Baskervville serif wordmark, deep-ocean ink.
 *
 * Run: npm run assets:generate
 */

import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const SAND = '#FFFFFF';
const CREAM = '#F2EDE4';
const DEEP_OCEAN = '#172451';

const ASSETS_DIR = path.join(process.cwd(), 'assets');

function iconSvg(size: number): string {
  const fontSize = size * 0.36;
  const labelSize = size * 0.058;
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="${SAND}"/>
    <rect x="${size * 0.06}" y="${size * 0.06}" width="${size * 0.88}" height="${size * 0.88}" fill="none" stroke="${DEEP_OCEAN}" stroke-width="${size * 0.006}" opacity="0.1"/>
    <text x="50%" y="${size * 0.5}" dominant-baseline="middle" text-anchor="middle"
      font-family="'The Seasons', 'Bodoni Moda', 'Georgia', 'Times New Roman', serif"
      font-weight="400" font-size="${fontSize}"
      fill="${DEEP_OCEAN}">
      CS
    </text>
    <text x="50%" y="${size * 0.83}" text-anchor="middle"
      font-family="'DM Sans', 'Helvetica Neue', sans-serif"
      font-weight="500" font-size="${labelSize}" letter-spacing="${labelSize * 0.18}"
      fill="${DEEP_OCEAN}">
      ROMA · DACH
    </text>
  </svg>`;
}

function splashSvg(width: number, height: number): string {
  const display = Math.min(width, height) * 0.14;
  const label = Math.min(width, height) * 0.024;
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="${SAND}"/>
    <rect x="0" y="${height * 0.6}" width="${width}" height="${height * 0.4}" fill="${CREAM}"/>
    <text x="50%" y="${height * 0.32}" text-anchor="middle"
      font-family="'DM Sans', 'Manrope', sans-serif"
      font-weight="500" font-size="${label}" letter-spacing="${label * 0.2}"
      fill="${DEEP_OCEAN}">
      ROMA · DACH · ISSUE I
    </text>
    <text x="50%" y="${height * 0.46}" text-anchor="middle"
      font-family="'The Seasons', 'Bodoni Moda', 'Georgia', serif"
      font-weight="400" font-size="${display}"
      fill="${DEEP_OCEAN}">
      CANINE
    </text>
    <text x="50%" y="${height * 0.54}" text-anchor="middle"
      font-family="'The Seasons', 'Bodoni Moda', 'Georgia', serif"
      font-weight="400" font-size="${display}"
      fill="${DEEP_OCEAN}">
      SOCIETY
    </text>
    <text x="50%" y="${height * 0.78}" text-anchor="middle"
      font-family="'The Seasons', 'Bodoni Moda', 'Georgia', serif"
      font-weight="400" font-style="italic" font-size="${label * 1.8}"
      fill="${DEEP_OCEAN}" opacity="0.7">
      It is your Canine Society.
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
