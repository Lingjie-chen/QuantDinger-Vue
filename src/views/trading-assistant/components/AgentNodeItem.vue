<template>
  <div
    :class="['agent-node-item', { active: selected }]"
    @click="$emit('select')"
  >
    <div class="agent-node-icon">
      <a-icon type="cloud-server" />
    </div>
    <div class="agent-node-body">
      <div class="agent-node-name">自主交易 Agent</div>
      <div class="agent-node-info">
        <span class="agent-node-status" :class="agentState">
          <span class="status-dot"></span>{{ statusText }}
        </span>
      </div>
    </div>
    <div class="agent-node-arrow">
      <a-icon type="right" />
    </div>
  </div>
</template>

<script>
const STATUS_MAP = {
  idle: '空闲',
  running: '运行中',
  paused: '已暂停',
  stopped: '已停止',
  error: '异常'
}

export default {
  name: 'AgentNodeItem',
  props: {
    agentState: { type: String, default: 'idle' },
    selected: { type: Boolean, default: false }
  },
  computed: {
    statusText () {
      return STATUS_MAP[this.agentState] || this.agentState
    }
  }
}
</script>

<style lang="less" scoped>
@import '@/assets/design-tokens.less';

.agent-node-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 8px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.06) 0%, rgba(168, 85, 247, 0.04) 100%);
  border: 1px solid rgba(99, 102, 241, 0.15);
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba(99, 102, 241, 0.4);
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.06) 100%);
  }

  &.active {
    border-color: #6366f1;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%);
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
  }

  .agent-node-icon {
    font-size: 20px;
    color: #6366f1;
    line-height: 1;
  }

  .agent-node-body {
    flex: 1;
    min-width: 0;
  }

  .agent-node-name {
    font-size: 14px;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 2px;
  }

  .agent-node-info {
    font-size: 12px;
  }

  .agent-node-status {
    display: inline-flex;
    align-items: center;
    gap: 4px;

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: @qd-text-secondary-light;
    }

    &.running .status-dot {
      background: @qd-green;
      animation: agent-node-pulse 2s infinite;
    }
    &.paused .status-dot { background: #f59e0b; }
    &.error .status-dot  { background: @qd-red; }
  }

  .agent-node-arrow {
    color: #94a3b8;
    font-size: 12px;
  }
}

@keyframes agent-node-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
