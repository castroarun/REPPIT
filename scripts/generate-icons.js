const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Android icon sizes (launcher icons)
const androidSizes = [
  { name: 'mdpi', size: 48 },
  { name: 'hdpi', size: 72 },
  { name: 'xhdpi', size: 96 },
  { name: 'xxhdpi', size: 144 },
  { name: 'xxxhdpi', size: 192 }
];

// SVG source
const svgPath = path.join(__dirname, '../public/icons/icon-512.svg');
const svgContent = fs.readFileSync(svgPath, 'utf8');

// Android res directory
const androidResDir = path.join(__dirname, '../android/app/src/main/res');

async function generateIcons() {
  console.log('Generating Android icons...\n');

  for (const { name, size } of androidSizes) {
    const outputDir = path.join(androidResDir, `mipmap-${name}`);

    // Ensure directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate launcher icon
    const launcherPath = path.join(outputDir, 'ic_launcher.png');
    await sharp(Buffer.from(svgContent))
      .resize(size, size)
      .png()
      .toFile(launcherPath);
    console.log(`Created: mipmap-${name}/ic_launcher.png (${size}x${size})`);

    // Generate round launcher icon
    const roundPath = path.join(outputDir, 'ic_launcher_round.png');
    await sharp(Buffer.from(svgContent))
      .resize(size, size)
      .png()
      .toFile(roundPath);
    console.log(`Created: mipmap-${name}/ic_launcher_round.png (${size}x${size})`);

    // Generate foreground icon (slightly larger for adaptive icons)
    const foregroundSize = Math.round(size * 1.5);
    const foregroundPath = path.join(outputDir, 'ic_launcher_foreground.png');
    await sharp(Buffer.from(svgContent))
      .resize(foregroundSize, foregroundSize)
      .png()
      .toFile(foregroundPath);
    console.log(`Created: mipmap-${name}/ic_launcher_foreground.png (${foregroundSize}x${foregroundSize})`);
  }

  // Generate PWA icons
  const pwaDir = path.join(__dirname, '../public/icons');

  await sharp(Buffer.from(svgContent))
    .resize(192, 192)
    .png()
    .toFile(path.join(pwaDir, 'icon-192.png'));
  console.log('\nCreated: public/icons/icon-192.png (192x192)');

  await sharp(Buffer.from(svgContent))
    .resize(512, 512)
    .png()
    .toFile(path.join(pwaDir, 'icon-512.png'));
  console.log('Created: public/icons/icon-512.png (512x512)');

  console.log('\nAll icons generated successfully!');
}

generateIcons().catch(console.error);
