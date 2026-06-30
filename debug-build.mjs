import { build } from 'vite';

function createDebugPlugin() {
  return {
    name: 'debug-plugin',
    transform: {
      order: 'post',
      handler(code, id) {
        if (id.endsWith('ai-asset-analysis/index.vue') && !id.includes('\x00') && !id.includes('?script')) {
          console.log('=== POST VUE TRANSFORM ===');
          const lines = code.split('\n');
          console.log('Total lines:', lines.length, 'chars:', code.length);
          
          // Show lines around line 253
          const start = Math.max(0, 240);
          const end = Math.min(lines.length, 280);
          for (let i = start; i < end; i++) {
            console.log(`${i+1}: ${lines[i]}`);
          }
          
          return null;
        }
      }
    }
  };
}

try {
  await build({
    root: '.',
    logLevel: 'silent',
    plugins: [createDebugPlugin()]
  });
  console.log('BUILD SUCCEEDED');
} catch(e) {
  console.log('BUILD FAILED:', e.message.substring(0, 200));
}
