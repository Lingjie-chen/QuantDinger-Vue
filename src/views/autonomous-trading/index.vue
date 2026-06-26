<template>
  <div class="autonomous-trading" :class="{ 'theme-dark': isDarkTheme }">
    <agent-console-view
      :agent-state="agent.agentState.value"
      :status-loading="agent.statusLoading.value"
      :action-loading="agent.actionLoading.value"
      :config-saving="agent.configSaving.value"
      :status="agent.status.value"
      :perf="agent.perf.value"
      :positions="agent.positions.value"
      :trades="agent.trades.value"
      :decisions="agent.decisions.value"
      :config="agent.config.value"
      :kline-data="klineData"
      :kline-signals="klineSignals"
      :chart-symbol="chartSymbol"
      :chart-interval="chartInterval"
      @start="onStart"
      @pause="onPause"
      @resume="onResume"
      @stop="onStop"
      @refresh="agent.fetchStatus"
      @save-config="onSaveConfig"
      @symbol-change="onSymbolChange"
      @interval-change="onIntervalChange"
    />
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { mapState } from 'vuex'
import { useAgentState } from '@/views/trading-assistant/composables/useAgentState'
import AgentConsoleView from '@/views/trading-assistant/components/AgentConsoleView.vue'
import { message } from 'ant-design-vue'

export default {
  name: 'AutonomousTrading',
  components: { AgentConsoleView },
  computed: {
    ...mapState({ navTheme: state => state.app.theme }),
    isDarkTheme () {
      return this.navTheme === 'dark' || this.navTheme === 'realdark'
    }
  },
  setup () {
    const agent = useAgentState()

    // K 线状态在容器层持有，避免 AgentConsoleView 多实例重复请求
    const chartSymbol = ref('')
    const chartInterval = ref('15m')
    const klineData = ref([])
    const klineSignals = ref([])

    async function refreshKline () {
      const { klineData: kd, klineSignals: ks } = await agent.fetchKlineData(
        chartSymbol.value,
        chartInterval.value
      )
      klineData.value = kd
      klineSignals.value = ks
    }

    async function onSymbolChange (val) {
      chartSymbol.value = val
      await refreshKline()
    }

    async function onIntervalChange (val) {
      chartInterval.value = val
      await refreshKline()
    }

    async function onStart () {
      const res = await agent.handleStart()
      if (res.success) message.success('代理已启动')
      else if (res.message) message.error(res.message)
    }

    async function onPause () {
      const res = await agent.handlePause()
      if (res.success) message.success('代理已暂停')
    }

    async function onResume () {
      const res = await agent.handleResume()
      if (res.success) message.success('代理已恢复')
    }

    async function onStop () {
      const res = await agent.handleStop()
      if (res.success) message.success('代理已停止')
    }

    async function onSaveConfig (cfg) {
      const res = await agent.saveConfig(cfg)
      if (res.success) message.success('配置已保存')
      else if (res.message) message.error(res.message)
    }

    return {
      agent,
      chartSymbol,
      chartInterval,
      klineData,
      klineSignals,
      refreshKline,
      onSymbolChange,
      onIntervalChange,
      onStart,
      onPause,
      onResume,
      onStop,
      onSaveConfig
    }
  },
  async mounted () {
    await this.agent.fetchStatus()
    await this.agent.fetchData()
    // 自动选择第一个持仓的 K 线
    if (this.agent.positions.value.length && !this.chartSymbol) {
      this.chartSymbol = this.agent.positions.value[0].symbol
      await this.refreshKline()
    }
    this.agent.startPolling()
  },
  beforeDestroy () {
    this.agent.stopPolling()
  }
}
</script>

<style lang="less" scoped>
@import '@/assets/design-tokens.less';

.autonomous-trading {
  padding: 24px;
  min-height: 100vh;
  background: @qd-bg-gradient-light;
  background-attachment: fixed;

  &.theme-dark {
    background: @qd-bg-gradient-dark;
    background-attachment: fixed;
  }
}
</style>
