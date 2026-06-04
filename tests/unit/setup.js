import Vue from 'vue'
import Antd from 'ant-design-vue'

// Register Ant Design globally (needed for a-button, a-tabs, etc.)
Vue.use(Antd)

// Disable devtools tip during tests
Vue.config.productionTip = false
Vue.config.devtools = false

// Mock ResizeObserver (not available in happy-dom)
global.ResizeObserver = class ResizeObserver {
  observe () {}
  unobserve () {}
  disconnect () {}
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})
