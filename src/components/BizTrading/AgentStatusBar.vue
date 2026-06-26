<template>
  <div class="agent-status-bar">
    <div class="status-indicator" :class="state">
      <span class="status-dot"></span>
      <span class="status-text">{{ statusText }}</span>
    </div>
    <div class="status-actions">
      <a-button
        v-if="state === 'idle' || state === 'stopped'"
        type="primary"
        :loading="actionLoading"
        @click="$emit('start')"
      >
        <a-icon type="play-circle" /> 启动
      </a-button>
      <a-button
        v-if="state === 'running'"
        :loading="actionLoading"
        @click="$emit('pause')"
      >
        <a-icon type="pause-circle" /> 暂停
      </a-button>
      <a-button
        v-if="state === 'paused'"
        type="primary"
        :loading="actionLoading"
        @click="$emit('resume')"
      >
        <a-icon type="play-circle" /> 恢复
      </a-button>
      <a-button
        v-if="state === 'running' || state === 'paused'"
        danger
        :loading="actionLoading"
        @click="$emit('stop')"
      >
        <a-icon type="stop" /> 停止
      </a-button>
      <a-button :loading="statusLoading" @click="$emit('refresh')">
        <a-icon type="reload" />
      </a-button>
    </div>
  </div>
</template>

<script>
const STATUS_MAP = { idle: '空闲', running: '运行中', paused: '已暂停', stopped: '已停止', error: '异常' }

export default {
  name: 'AgentStatusBar',
  props: {
    state: {
      type: String,
      default: 'idle',
      validator: v => ['idle', 'running', 'paused', 'stopped', 'error'].includes(v)
    },
    actionLoading: { type: Boolean, default: false },
    statusLoading: { type: Boolean, default: false }
  },
  computed: {
    statusText () {
      return STATUS_MAP[this.state] || this.state
    }
  }
}
</script>

<style lang="less" scoped>
@import '@/assets/design-tokens.less';

.agent-status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  .qd-glass-light();
  border-radius: 12px;
  margin-bottom: 16px;
  .qd-card-hover-light();

  .theme-dark & {
    .qd-glass-dark();
    .qd-panel-glow();
    .qd-card-hover();
  }
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;

  .status-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: @qd-text-secondary-light;
  }

  &.running .status-dot {
    background: @qd-green;
    animation: agent-pulse 2s infinite;
  }
  &.paused .status-dot { background: #f59e0b; }
  &.error .status-dot  { background: @qd-red; }

  .status-text {
    font-weight: 600;
    color: @qd-text-primary-light;
    .theme-dark & { color: @qd-text-primary-dark; }
  }
}

@keyframes agent-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
