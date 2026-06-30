<template>
  <a-config-provider :locale="locale" :direction="direction">
    <div id="app">
      <router-view/>
    </div>
  </a-config-provider>
</template>

<script>
import { domTitle, setDocumentTitle } from '@/utils/domUtil'
import { i18nRender } from '@/locales'

export default {
  data () {
    return {
      _ariaObserver: null
    }
  },
  mounted () {
    this.fixAriaIssues()
    this._ariaObserver = new MutationObserver(() => this.fixAriaIssues())
    this._ariaObserver.observe(document.body, { childList: true, subtree: true })
  },
  beforeDestroy () {
    if (this._ariaObserver) {
      this._ariaObserver.disconnect()
    }
  },
  methods: {
    fixAriaIssues () {
      // 1. aria-prohibited-attr: <i aria-label> without role → add role="img"
      document.querySelectorAll('.anticon[aria-label]:not([role])').forEach(el => {
        el.setAttribute('role', 'img')
      })
      // 2. aria-required-attr: role="switch" needs aria-checked
      document.querySelectorAll('[role="switch"]:not([aria-checked])').forEach(el => {
        const checked = el.classList.contains('ant-switch-checked')
        el.setAttribute('aria-checked', String(checked))
      })
      // Sync aria-checked on click for ant-switch
      document.querySelectorAll('.ant-switch[role="switch"]').forEach(el => {
        if (!el._ariaSynced) {
          el._ariaSynced = true
          el.addEventListener('click', () => {
            el.setAttribute('aria-checked', String(el.classList.contains('ant-switch-checked')))
          })
        }
      })
      // 3. listitem: wrap stray <li class="ant-list-item"> — they should be in <ul>
      // Ant Design List renders <div><li> — add role="list" to the parent div
      document.querySelectorAll('li.ant-list-item').forEach(li => {
        const parent = li.parentElement
        if (parent && parent.tagName !== 'UL' && parent.tagName !== 'OL' && !parent.getAttribute('role')) {
          parent.setAttribute('role', 'list')
        }
      })
    }
  },
  computed: {
    locale () {
      const { title } = this.$route.meta
      title && (setDocumentTitle(`${i18nRender(title)} - ${domTitle}`))

      return this.$i18n.getLocaleMessage(this.$store.getters.lang).antLocale
    },
    direction () {
      const lang = this.$store.getters.lang
      return lang && /^ar/i.test(lang) ? 'rtl' : 'ltr'
    },
    theme () {
      return this.$store.state.app.theme
    }
  },
  watch: {
    theme: {
      handler (val) {
        if (val === 'dark' || val === 'realdark') {
          document.body.classList.add('dark')
          document.body.classList.toggle('realdark', val === 'realdark')
          document.body.classList.remove('light')
        } else {
          document.body.classList.remove('dark')
          document.body.classList.remove('realdark')
          document.body.classList.add('light')
        }
      },
      immediate: true
    }
  }
}
</script>
