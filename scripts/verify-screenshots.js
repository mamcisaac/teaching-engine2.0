/* eslint-env node */
import fs from 'fs';
import path from 'path';

const guidePath = path.resolve('USER_GUIDE.md');
if (!fs.existsSync(guidePath)) {
  console.log('USER_GUIDE.md not found, skipping screenshot verification.');
  process.exit(0);
}

const md = fs.readFileSync(guidePath, 'utf8');
const regex = /!\[[^\]]*\]\(([^)]+)\)/g;
const imagesDir = path.resolve('docs/images');
const missing = [];
const notInDir = [];
let match;
while ((match = regex.exec(md))) {
  const imgPath = match[1];
  const absolute = path.resolve(path.dirname(guidePath), imgPath);
  if (!absolute.startsWith(imagesDir)) {
    notInDir.push(imgPath);
  }
  if (!fs.existsSync(absolute)) {
    missing.push(imgPath);
  }
}

if (missing.length || notInDir.length) {
  if (notInDir.length) {
    console.error('Images not in docs/images:', notInDir.join(', '));
  }
  if (missing.length) {
    console.error('Missing images:', missing.join(', '));
  }
  process.exit(1);
}

console.log('All referenced screenshots are present.');
