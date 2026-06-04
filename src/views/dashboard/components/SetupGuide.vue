<template>
  <div class="setup-guide" :class="{ 'theme-dark': isDarkTheme }">
    <div class="guide-header">
      <span class="guide-title">{{ $t('dashboard.setup_guide') }}</span>
      <a-tooltip :title="$t('dashboard.hide_guide_tip')">
        <a-icon type="close" class="guide-close" @click="onClose" />
      </a-tooltip>
    </div>
    <div class="guide-steps">
      <div class="guide-step" v-for="(step, idx) in steps" :key="idx">
        <div :class="['step-indicator', step.completed ? 'completed' : 'active']">
          <a-icon v-if="step.completed" type="check" />
          <span v-else>{{ idx + 1 }}</span>
        </div>
        <div class="step-content">
          <div class="step-title">{{ step.title }}</div>
          <div class="step-desc">{{ step.desc }}</div>
          <a-button v-if="step.action" size="small" type="link" @click="step.action.handler">
            {{ step.action.label }}
          </a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SetupGuide',
  props: {
    exchangeConnected: { type: Boolean, default: false },
    strategyConfigured: { type: Boolean, default: false },
    firstTradeExecuted: { type: Boolean, default: false },
    isDarkTheme: { type: Boolean, default: false }
  },
  emits: ['close'],
  computed: {
    steps() {
      return [
        {
          title: this.$t('dashboard.guide_step1_title'),
          desc: this.$t('dashboard.guide_step1_desc'),
          completed: this.exchangeConnected,
          action: this.exchangeConnected ? null : {
            label: this.$t('dashboard.guide_step1_action'),
            handler: () => this.$router.push('/settings/exchange')
          }
        },
        {
          title: this.$t('dashboard.guide_step2_title'),
          desc: this.$t('dashboard.guide_step2_desc'),
          completed: this.strategyConfigured,
          action: this.strategyConfigured ? null : {
            label: this.$t('dashboard.guide_step2_action'),
            handler: () => this.$router.push('/strategies')
          }
        },
        {
          title: this.$t('dashboard.guide_step3_title'),
          desc: this.$t('dashboard.guide_step3_desc'),
          completed: this.firstTradeExecuted,
          action: this.firstTradeExecuted ? null : {
            label: this.$t('dashboard.guide_step3_action'),
            handler: () => this.$router.push('/signals')
          }
        }
      ]
    }
  },
  methods: {
    onClose() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped lang="less">
.setup-guide {
  background: linear-gradient(135deg, #e6f7ff 0%, #f0f5ff 100%);
  border: 1px solid #91d5ff;
  border-radius: 8px;
  padding: 16px 20px;
  margin-bottom: 16px;

  .guide-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;

    .guide-title {
      font-weight: 600;
      font-size: 15px;
      color: #0050b3;
    }

    .guide-close {
      cursor: pointer;
      color: #8c8c8c;
      font-size: 16px;
      &:hover { color: #262626; }
    }
  }

  .guide-steps {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;

    .guide-step {
      display: flex;
      gap: 12px;
      flex: 1;
      min-width: 200px;

      .step-indicator {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        font-weight: 600;
        flex-shrink: 0;

        &.active {
          background: #1890ff;
          color: #fff;
        }
        &.completed {
          background: #52c41a;
          color: #fff;
        }
      }

      .step-content {
        flex: 1;

        .step-title {
          font-weight: 600;
          font-size: 14px;
          color: #262626;
          margin-bottom: 4px;
        }

        .step-desc {
          font-size: 12px;
          color: #595959;
          line-height: 1.5;
        }
      }
    }
  }

  // dark theme
  &.theme-dark {
    background: linear-gradient(135deg, #111d2c 0%, #1a1a2e 100%);
    border-color: #153450;

    .guide-header .guide-title { color: #177ddc; }
    .guide-steps .guide-step {
      .step-content {
        .step-title { color: #e6e6e6; }
        .step-desc { color: #a6a6a6; }
      }
    }
  }
}
</style>
