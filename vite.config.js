import { defineConfig, loadEnv } from 'vite'
import vue2 from '@vitejs/plugin-vue2'
import vue2Jsx from '@vitejs/plugin-vue2-jsx'
import svgLoader from 'vite-svg-loader'
import { viteMockServe } from 'vite-plugin-mock'
import vitePluginImp from 'vite-plugin-imp'
import { fileURLToPath, URL } from 'node:url'
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'))

const gitHash = (() => {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim()
  } catch (e) {
    return 'unknown'
  }
})()

const buildDate = new Date().toLocaleString()

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const enableMock = env.VITE_ENABLE_MOCK === 'true'

  return {
    base: './',
    resolve: {
      alias: [
        // webpack 风格的 ~package/... less @import → 直接命中 node_modules
        { find: /^~(.+)/, replacement: '$1' },
        // pro-layout 1.x 仍引用 webpack 专用插件 client，用 shim 兼容
        {
          find: 'webpack-theme-color-replacer/client',
          replacement: fileURLToPath(new URL('./src/shims/webpack-theme-color-replacer-client.js', import.meta.url)),
        },
        // moment 纯 CJS（module.exports = ctor），Vite 下 `import * as moment from 'moment'`
        // namespace 拿不到 isMoment 等静态方法 → 走 shim 平铺 named exports
        { find: /^moment$/, replacement: fileURLToPath(new URL('./src/shims/moment.js', import.meta.url)) },
        { find: /^store$/, replacement: 'store/dist/store.modern.js' },
        { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
        { find: '@$', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
      ],
      // 兼容旧代码中省略 .vue 后缀的 import（如 `import App from './App'`）
      extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    },
    define: {
      APP_VERSION: JSON.stringify(pkg.version),
      GIT_HASH: JSON.stringify(gitHash),
      BUILD_DATE: JSON.stringify(buildDate),
      // 兼容旧代码中的 process.env.VUE_APP_* 引用 —— 直接映射到 import.meta.env.VITE_*
      'process.env.VUE_APP_PREVIEW': JSON.stringify(env.VITE_PREVIEW || ''),
      'process.env.VUE_APP_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL || ''),
      'process.env.VUE_APP_PYTHON_API_BASE_URL': JSON.stringify(env.VITE_PYTHON_API_BASE_URL || ''),
      'process.env.VUE_APP_PYODIDE_CDN_BASE': JSON.stringify(env.VITE_PYODIDE_CDN_BASE || ''),
      'process.env.VUE_APP_PYODIDE_LOCAL_BASE': JSON.stringify(env.VITE_PYODIDE_LOCAL_BASE || ''),
      'process.env.VUE_APP_PYODIDE_PREFER_CDN': JSON.stringify(env.VITE_PYODIDE_PREFER_CDN || ''),
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          additionalData: "@import '@/styles/antd-vars.less';\n",
          modifyVars: {
            'border-radius-base': '2px',
          },
        },
      },
    },
    plugins: [
      vue2(),
      vue2Jsx(),
      svgLoader({ defaultImport: 'url' }),
      // 按需引入 ant-design-vue 1.x：自动把 `import { Button } from 'ant-design-vue'`
      // 重写为 `import Button from 'ant-design-vue/es/button'` + 对应 style
      vitePluginImp({
        libList: [
          {
            libName: 'ant-design-vue',
            style(name) {
              // ant-design-vue 1.x es 目录用 kebab-case：button → ant-design-vue/es/button/style/css
              return `ant-design-vue/es/${name}/style/css`
            },
          },
        ],
      }),
      viteMockServe({
        mockPath: 'src/mock/services',
        enable: enableMock,
        watchFiles: true,
        logger: true,
      }),
    ],
    server: {
      port: 8888,
      proxy: {
        '/api': {
          target: env.VITE_DEV_PROXY_TARGET || 'http://localhost:8000',
          ws: true,
          changeOrigin: true,
          timeout: 600000,
          proxyTimeout: 600000,
        },
      },
    },
    worker: {
      format: 'es',
    },
    optimizeDeps: {
      // pyodide 自己通过 Worker 内 importScripts 加载，不参与 Vite 预构建
      exclude: ['pyodide'],
    },
    build: {
      target: 'es2021',
      cssMinify: 'esbuild',
      sourcemap: false,
      chunkSizeWarningLimit: 1500,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return
            // Vue core ecosystem
            if (id.includes('/vue/') || id.includes('/vue-router/') || id.includes('/vuex/')) return 'vue-core'
            if (id.includes('/vue-i18n/')) return 'vue-i18n'
            // Ant Design (largest UI lib)
            if (id.includes('ant-design-vue') || id.includes('@ant-design') || id.includes('ant-design')) return 'antd'
            if (id.includes('@ant-design-vue/pro-layout')) return 'antd'
            // Heavy chart libs — echarts/core tree-shaking: don't force-chunk echarts subpackages
            if (id.includes('zrender')) return 'zrender'
            if (id.includes('/klinecharts/')) return 'klinecharts'
            if (id.includes('viser-vue') || id.includes('@antv')) return 'antv'
            // Editor libs
            if (id.includes('/codemirror/')) return 'codemirror'
            if (id.includes('wangeditor') || id.includes('vue-quill-editor')) return 'editors'
            // Utils
            if (id.includes('/moment/')) return 'moment'
            if (id.includes('lodash-es') || id.includes('/lodash/')) return 'lodash'
            if (id.includes('/axios/')) return 'axios'
            // Pyodide - isolated
            if (id.includes('pyodide')) return 'pyodide'
          },
        },
      },
    },
  }
})
