import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import JSZip from 'jszip';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(root, 'dist');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const version = pkg.version || '1.0.0';
const outName = `DesignForge-Web-${version}.zip`;
const outPath = path.join(root, 'release', outName);

if (!fs.existsSync(distDir)) {
  console.error('Missing dist/ folder. Run "npm run build" first.');
  process.exit(1);
}

function addDir(zip, dir, base = '') {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = path.posix.join(base, entry.name);
    if (entry.isDirectory()) {
      addDir(zip, full, rel);
    } else {
      zip.file(rel, fs.readFileSync(full));
    }
  }
}

const zip = new JSZip();
addDir(zip, distDir);
zip.file(
  'README.txt',
  [
    'DesignForge — Web Package',
    '========================',
    '',
    'Option A: Host online',
    '  Upload all files in this ZIP to any static host (Netlify, Vercel, S3, etc.).',
    '  Open index.html via HTTPS for full PWA install support.',
    '',
    'Option B: Run locally',
    '  1. Extract this ZIP',
    '  2. Run: npx serve .',
    '  3. Open the URL shown in your browser',
    '',
    `Version: ${version}`,
  ].join('\r\n'),
);

fs.mkdirSync(path.join(root, 'release'), { recursive: true });
const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 9 } });
fs.writeFileSync(outPath, buffer);
console.log(`Created ${outPath}`);
