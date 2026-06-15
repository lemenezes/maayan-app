import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create SVG with gradient background and text
const svg = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0C5A86;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1DAFD9;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background with gradient -->
  <rect width="1200" height="630" fill="url(#grad)"/>
  
  <!-- Decorative circles for visual interest -->
  <circle cx="100" cy="100" r="150" fill="#1DAFD9" opacity="0.3"/>
  <circle cx="1100" cy="530" r="200" fill="#0C5A86" opacity="0.2"/>
  
  <!-- Logo text -->
  <text x="600" y="280" font-family="Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="96" font-weight="700" text-anchor="middle" fill="white">
    Desapega
  </text>
  <text x="600" y="370" font-family="Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="96" font-weight="700" text-anchor="middle" fill="white">
    Maayan
  </text>
  
  <!-- Subtitle -->
  <text x="600" y="450" font-family="Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="32" text-anchor="middle" fill="rgba(255,255,255,0.9)">
    Anúncios • Produtos • Serviços
  </text>
</svg>
`;

// Define output path
const outputPath = path.join(__dirname, '../public/og-image.png');

// Ensure public directory exists
const publicDir = path.dirname(outputPath);
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate PNG from SVG
sharp(Buffer.from(svg))
  .png()
  .toFile(outputPath)
  .then(() => {
    console.log(`✓ Open Graph image created: ${outputPath}`);
    console.log(`  Dimensions: 1200x630px`);
    console.log(`  File size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)}KB`);
  })
  .catch(err => {
    console.error('✗ Error generating og-image.png:', err);
    process.exit(1);
  });
