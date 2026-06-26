<template>
  <a-form-model :model="form" layout="vertical" class="agent-config-form">
    <a-form-model-item label="交易标的">
      <a-select v-model="form.symbols" mode="tags" placeholder="输入交易对" />
    </a-form-model-item>
    <a-form-model-item label="分析间隔（秒）">
      <a-input-number v-model="form.analysis_interval" :min="5" :max="3600" />
    </a-form-model-item>
    <a-form-model-item label="单笔最大仓位（0.01=1%）">
      <a-slider v-model="form.max_position_size" :min="0.01" :max="1" :step="0.01" />
    </a-form-model-item>
    <a-form-model-item>
      <a-button type="primary" :loading="saving" @click="$emit('save', form)">
        保存配置
      </a-button>
    </a-form-model-item>
  </a-form-model>
</template>

<script>
export default {
  name: 'AgentConfigForm',
  props: {
    config: {
      type: Object,
      default: () => ({ symbols: [], analysis_interval: 60, max_position_size: 0.1 })
    },
    saving: { type: Boolean, default: false }
  },
  data () {
    return {
      form: { ...this.config }
    }
  },
  watch: {
    config: {
      handler (val) { this.form = { ...val } },
      deep: true
    }
  }
}
</script>

<style lang="less" scoped>
.agent-config-form {
  max-width: 600px;
}
</style>
