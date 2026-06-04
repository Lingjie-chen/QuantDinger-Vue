import { defineConfig } from 'vitest/config'
import vue2 from '@vitejs/plugin-vue2'
import vue2Jsx from '@vitejs/plugin-vue2-jsx'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue2(), vue2Jsx()],
  resolve: {
    alias: [
      { find: /^~(.+)/, replacement: '$1' },
      { find: /^store$/, replacement: 'store/dist/store.modern.js' },
      { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
      { find: '@$', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
    ],
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.vue'],
  },
  css: {
    preprocessorOptions: {
      less: { javascriptEnabled: true },
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/unit/setup.js'],
    include: ['tests/unit/**/*.spec.js'],
    server: {
      deps: {
        inline: ['ant-design-vue'],
      },
    },
  },
})
