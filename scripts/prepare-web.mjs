import { mkdir, copyFile, rm } from 'node:fs/promises';

const files = [
  'index.html',
  'ludo.js',
  'manifest.webmanifest',
  'icon.svg',
  'icon-192.png',
  'icon-512.png',
];

await rm('www', { recursive: true, force: true });
await mkdir('www', { recursive: true });
for (const file of files) {
  await copyFile(file, `www/${file}`);
}
console.log('Prepared AKX web assets for the Android package.');
