import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import fs from 'fs';
import path from 'path';

const vuePlugin = require('@vitejs/plugin-vue2');
const plugin = vuePlugin.default ? vuePlugin.default() : vuePlugin();
console.log('Plugin name:', plugin.name);
console.log('Transform exists:', typeof plugin.transform === 'function');

const filePath = path.resolve(process.argv[2] || 'src/views/ai-asset-analysis/index.vue');
const code = fs.readFileSync(filePath, 'utf-8');
console.log('File path:', filePath);
console.log('File length:', code.length);

// Run transform with a mock context
const transformResult = await plugin.transform.call({
  config: {}
}, code, filePath);

if (transformResult) {
  const out = typeof transformResult === 'string' ? transformResult : transformResult.code;
  console.log('Transform result length:', out.length);
  const lines = out.split('\n');
  console.log('Total output lines:', lines.length);
  for (let i = Math.max(0, 248); i < Math.min(lines.length, 268); i++) {
    console.log((i+1) + ': ' + lines[i]);
  }
} else {
  console.log('No transform result');
}
