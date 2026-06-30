// Manually simulate what @vitejs/plugin-vue2 does to a .vue file
import { createRequire } from 'module';
import { transformWithEsbuild } from 'vite';
import * as fs from 'fs';
import * as path from 'path';

const require = createRequire(import.meta.url);

// 1. Read the Vue2 plugin source
const pkgPath = require.resolve('@vitejs/plugin-vue2/package.json');
const pkgDir = path.dirname(pkgPath);
const pluginSrc = path.join(pkgDir, 'dist', 'index.mjs');
console.log('Plugin:', pluginSrc);

// 2. Read the source file
const srcPath = path.resolve('src/views/ai-asset-analysis/index.vue');
const src = fs.readFileSync(srcPath, 'utf-8');
console.log('Source file size:', src.length, 'bytes');
console.log('---First 1000 chars---');
console.log(src.substring(0, 1000));
console.log('---Last 500 chars---');
console.log(src.substring(src.length - 500));

// 3. Read plugin code to understand the transform
const pluginCode = fs.readFileSync(pluginSrc, 'utf-8');

// Find the transform function
const transformMatch = pluginCode.match(/transform\s*[\(:]/
  + /[\s\S]*?\{[\s\S]*?\/\/\s*<template>[\s\S]*?\}\s*\)?/);
// Just print the relevant sections
console.log('\n--- Plugin code sections ---');

// Find key functions
const sections = ['parseVueRequest', 'compileSFCTemplate', 'transform', 'genScriptCode', 'genTemplateCode'];
for (const name of sections) {
  const re = new RegExp('(async\\s+)?function\\s+' + name + '|' + name + '\\s*[=(]', 'g');
  let match;
  while ((match = re.exec(pluginCode)) !== null) {
    const start = Math.max(0, match.index - 20);
    const end = Math.min(pluginCode.length, match.index + 80);
    console.log(`\n--- ${name} at ${match.index} ---`);
    console.log(pluginCode.substring(start, end));
  }
}
