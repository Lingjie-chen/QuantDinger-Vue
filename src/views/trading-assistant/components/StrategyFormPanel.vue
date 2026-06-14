<template>
  <a-modal
    :visible="visible"
    :title="modalTitle"
    :width="isMobile ? '95%' : 1120"
    :confirmLoading="saving"
    @ok="$emit('submit')"
    @cancel="$emit('cancel')"
    :maskClosable="false"
    :wrapClassName="wrapClass"
    :bodyStyle="{ maxHeight: '76vh', overflowY: 'auto', paddingBottom: '8px' }">
    <!--
      This component is a presentational wrapper for the strategy form modal.
      All form logic, state management, and API calls remain in the parent
      component (index.vue) because Ant Design Vue 1.x v-decorator requires
      the form instance to live in the same component as the template.

      The parent passes all necessary state via props and injects the form
      instance through provide/inject.
    -->
    <slot></slot>

    <template slot="footer">
      <slot name="footer"></slot>
    </template>
  </a-modal>
</template>

<script>
export default {
  name: 'StrategyFormPanel',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    editingStrategy: {
      type: Object,
      default: null
    },
    strategyMode: {
      type: String,
      default: ''
    },
    isDarkTheme: {
      type: Boolean,
      default: false
    },
    isMobile: {
      type: Boolean,
      default: false
    },
    saving: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    modalTitle () {
      return this.editingStrategy
        ? this.$t('trading-assistant.editStrategy')
        : this.$t('trading-assistant.createStrategy') + (this.strategyMode === 'script' ? ' - ' + this.$t('trading-assistant.strategyMode.script') : '')
    },
    wrapClass () {
      const classes = ['strategy-form-modal']
      if (this.isMobile) classes.push('mobile-modal')
      if (this.isDarkTheme) classes.push('strategy-form-modal-dark')
      return classes.join(' ')
    }
  }
}
</script>
