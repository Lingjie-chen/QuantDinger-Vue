<template>
  <div class="quant-workflow" :class="{ 'theme-dark': isDarkTheme }">
    <div class="page-header">
      <h3>量化工作流</h3>
    </div>

    <div class="workflow-steps">
      <div v-for="(step, i) in workflowStatus.steps" :key="i" class="step-card" :class="step.status">
        <div class="step-num">{{ i + 1 }}</div>
        <div class="step-info">
          <div class="step-name">{{ step.name }}</div>
          <div class="step-detail">{{ step.detail || '—' }}</div>
        </div>
        <div class="step-status">
          <a-tag :color="stepColor(step.status)">{{ step.statusText }}</a-tag>
        </div>
      </div>
    </div>

    <div class="action-panel">
      <a-form layout="inline">
        <a-form-item label="标的"><a-input v-model="runConfig.symbol" placeholder="BTC-USDT-SWAP" style="width:160px" /></a-form-item>
        <a-form-item label="策略"><a-select v-model="runConfig.strategy_type" style="width:140px">
          <a-select-option value="auto">自动</a-select-option>
          <a-select-option value="trend">趋势</a-select-option>
          <a-select-option value="mean_reversion">均值回归</a-select-option>
          <a-select-option value="momentum">动量</a-select-option>
        </a-select></a-form-item>
        <a-form-item>
          <a-button type="primary" @click="runWorkflow" :loading="runLoading"><a-icon type="thunderbolt" /> 运行工作流</a-button>
        </a-form-item>
      </a-form>
    </div>

    <a-table v-if="results.length" :columns="resultColumns" :data-source="results" size="small" row-key="id" class="pro-table" style="margin-top:16px" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { runWorkflow, getWorkflowStatus } from '@/api/quant-workflow'

export default {
  name: 'QuantWorkflow',
  data () {
    return {
      runLoading: false,
      workflowStatus: { steps: [
        { name: '市场情报', status: 'pending', statusText: '待运行', detail: '数据采集 + 技术指标' },
        { name: '策略选择', status: 'pending', statusText: '待运行', detail: '信号生成 + Agent 分析' },
        { name: '风控审查', status: 'pending', statusText: '待运行', detail: '仓位分配 + 风控检查' },
        { name: '执行调度', status: 'pending', statusText: '待运行', detail: '下单 + 滑点监控' },
        { name: '绩效回顾', status: 'pending', statusText: '待运行', detail: '绩效追踪 + 进化触发' },
      ]},
      runConfig: { symbol: 'BTC-USDT-SWAP', strategy_type: 'auto' },
      results: [],
      resultColumns: [
        { title: '阶段', dataIndex: 'phase', width: 120 },
        { title: '结果', dataIndex: 'result' },
        { title: '耗时', dataIndex: 'duration_ms', width: 100 },
      ],
    }
  },
  computed: {
    ...mapState({ navTheme: state => state.app.theme }),
    isDarkTheme () { return this.navTheme === 'dark' || this.navTheme === 'realdark' },
  },
  methods: {
    async runWorkflow () {
      this.runLoading = true
      try {
        const res = await runWorkflow(this.runConfig)
        if (res.success || res.code === 1) {
          this.$message.success('工作流已触发')
          this.results = (res.data || {}).results || []
        } else this.$message.error(res.message || '运行失败')
      } catch (e) { this.$message.error('运行失败') } finally { this.runLoading = false }
    },
    stepColor (s) { return { running: 'blue', completed: 'green', failed: 'red' }[s] || 'default' },
  },
}
</script>

<style lang="less" scoped>
@bg-light: #f8fafc; @bg-card: #fff; @border: #e2e8f0;
@text-primary: #1e293b; @text-secondary: #64748b; @blue: #3b82f6;

.quant-workflow {
  padding: 20px; background: @bg-light; min-height: 100vh;
  .page-header { margin-bottom: 16px; h3 { margin: 0; } }
  .workflow-steps { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
  .step-card {
    display: flex; align-items: center; gap: 12px; padding: 14px 16px;
    background: @bg-card; border: 1px solid @border; border-radius: 10px;
    &.running { border-color: @blue; }
    &.completed { border-color: #10b981; }
    &.failed { border-color: #ef4444; }
  }
  .step-num { width: 28px; height: 28px; border-radius: 50%; background: @blue; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
  .step-info { flex: 1; .step-name { font-weight: 600; color: @text-primary; } .step-detail { font-size: 12px; color: @text-secondary; } }
  .action-panel { background: @bg-card; border: 1px solid @border; border-radius: 10px; padding: 16px; }
}
</style>
