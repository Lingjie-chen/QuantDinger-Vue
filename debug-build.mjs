import { build } from 'vite';

try {
  const result = await build({
    root: '.',
    logLevel: 'silent',
    plugins: [{
      name: 'debug-vue',
      enforce: 'pre',
      transform(code, id) {
        if (id.includes('ai-asset-analysis/index.vue') && !id.includes('?vue') && !id.includes('\x00')) {
          console.log('=== TRANSFORMED CODE ===');
          console.log(code.substring(0, 3000));
          console.log('...');
          console.log('=== END at char', code.length, '===');
        }
      }
    }]
  });
  console.log('SUCCESS');
} catch(e) {
  console.log('BUILD FAILED:', e.message);
}
