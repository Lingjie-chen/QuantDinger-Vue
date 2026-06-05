<template>
  <div class="evolution-engine" :class="{ 'theme-dark': isDarkTheme }">
    <a-tabs v-model="activeTab" class="main-tabs">
      <a-tab-pane key="dashboard" tab="进化仪表盘">
        <div class="kpi-grid">
          <div class="kpi-card"><div class="kpi-label">进化代数</div><div class="kpi-value">{{ dashboard.generation || 0 }}</div></div>
          <div class="kpi-card"><div class="kpi-label">最佳 Sharpe</div><div class="kpi-value positive">{{ formatNumber(dashboard.best_sharpe) }}</div></div>
          <div class="kpi-card"><div class="kpi-label">策略变体</div><div class="kpi-value">{{ dashboard.total_variants || 0 }}</div></div>
          <div class="kpi-card"><div class="kpi-label">活跃 A/B 测试</div><div class="kpi-value">{{ abTests.filter(t => t.status === 'running').length }}</div></div>
        </div>
      </a-tab-pane>

      <a-tab-pane key="hyperopt" tab="超参优化">
        <div class="hyperopt-panel">
          <div class="hyperopt-status">
            <span>状态:</span>
            <a-tag :color="hyperopt.is_running ? 'blue' : 'default'">{{ hyperopt.is_running ? '运行中' : '空闲' }}</a-tag>
            <a-progress v-if="hyperopt.is_running" :percent="Math.round((hyperopt.progress / (hyperopt.total || 1)) * 100)" :stroke-color="'#3b82f6'" style="max-width:400px" />
          </div>
          <a-form layout="inline" style="margin:16px 0">
            <a-form-item label="算法">
              <a-select v-model="hyperoptConfig.algorithm" style="width:140px">
                <a-select-option value="bayesian">贝叶斯</a-select-option>
                <a-select-option value="random">随机搜索</a-select-option>
                <a-select-option value="grid">网格搜索</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="轮数">
              <a-input-number v-model="hyperoptConfig.n_trials" :min="5" :max="500" />
            </a-form-item>
            <a-form-item>
              <a-button v-if="!hyperopt.is_running" type="primary" @click="startHyperopt">开始优化</a-button>
              <a-button v-else danger @click="stopHyperopt">停止</a-button>
            </a-form-item>
          </a-form>
          <div v-if="hyperopt.best_params" class="best-params">
            <h4>最佳参数</h4>
            <pre>{{ JSON.stringify(hyperopt.best_params, null, 2) }}</pre>
          </div>
        </div>
      </a-tab-pane>

      <a-tab-pane key="ab" tab="A/B 测试">
        <div class="ab-header">
          <a-button type="primary" @click="showCreateAb = true"><a-icon type="plus" /> 新建 A/B 测试</a-button>
        </div>
        <a-table :columns="abColumns" :data-source="abTests" size="small" row-key="id" class="pro-table">
          <template slot="status" slot-scope="text">
            <a-tag :color="text === 'running' ? 'blue' : text === 'completed' ? 'green' : 'default'">{{ text }}</a-tag>
          </template>
        </a-table>
      </a-tab-pane>

      <a-tab-pane key="sandbox" tab="沙盒">
        <a-descriptions bordered size="small" :column="2">
          <a-descriptions-item label="状态">{{ sandbox.status || '—' }}</a-descriptions-item>
          <a-descriptions-item label="运行策略数">{{ sandbox.strategy_count || 0 }}</a-descriptions-item>
        </a-descriptions>
        <a-button @click="fetchSandbox" style="margin-top:12px"><a-icon type="reload" /> 刷新</a-button>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import {
  getEvolutionDashboard, getHyperoptStatus, startHyperopt, stopHyperopt,
  getHyperoptResults, getAbTests, getSandboxStatus
} from '@/api/evolution'

export default {
  name: 'EvolutionEngine',
  data () {
    return {
      activeTab: 'dashboard',
      dashboard: {},
      hyperopt: { is_running: false, progress: 0, total: 0, best_params: null },
      hyperoptConfig: { algorithm: 'bayesian', n_trials: 20 },
      abTests: [],
      sandbox: {},
      showCreateAb: false,
      abColumns: [
        { title: 'ID', dataIndex: 'id', width: 60 },
        { title: '名称', dataIndex: 'name' },
        { title: '状态', dataIndex: 'status', width: 100, scopedSlots: { customRender: 'status' } },
        { title: '创建时间', dataIndex: 'created_at', width: 160 },
      ],
      pollTimer: null,
    }
  },
  computed: {
    ...mapState({ navTheme: state => state.app.theme }),
    isDarkTheme () { return this.navTheme === 'dark' || this.navTheme === 'realdark' },
  },
  mounted () { this.fetchAll(); this.pollTimer = setInterval(() => this.fetchHyperopt(), 5000) },
  beforeDestroy () { if (this.pollTimer) clearInterval(this.pollTimer) },
  methods: {
    async fetchAll () {
      try { const r = await getEvolutionDashboard(); this.dashboard = r.data || r || {} } catch (e) { console.error(e) }
      this.fetchHyperopt()
      this.fetchAb()
      this.fetchSandbox()
    },
    async fetchHyperopt () {
      try { const r = await getHyperoptStatus(); this.hyperopt = r.data || r || this.hyperopt } catch (e) { console.error(e) }
    },
    async startHyperopt () {
      try { await startHyperopt(this.hyperoptConfig); this.$message.success('优化已启动'); this.fetchHyperopt() } catch (e) { this.$message.error('启动失败') }
    },
    async stopHyperoptRun () {
      try { await stopHyperopt(); this.$message.success('已停止'); this.fetchHyperopt() } catch (e) { this.$message.error('停止失败') }
    },
    async fetchAb () {
      try { const r = await getAbTests(); this.abTests = (r.data || r) || [] } catch (e) { console.error(e) }
    },
    async fetchSandbox () {
      try { const r = await getSandboxStatus(); this.sandbox = r.data || r || {} } catch (e) { console.error(e) }
    },
    formatNumber (v, d = 2) { return v == null ? '—' : Number(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) },
  },
}
</script>

<style lang="less" scoped>
@bg-light: #f8fafc; @bg-card: #fff; @border: #e2e8f0;
@text-primary: #1e293b; @text-secondary: #64748b; @green: #10b981;

.evolution-engine {
  padding: 20px; background: @bg-light; min-height: 100vh;
  .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 16px; }
  .kpi-card { background: @bg-card; border: 1px solid @border; border-radius: 12px; padding: 16px;
    .kpi-label { font-size: 11px; color: @text-secondary; text-transform: uppercase; margin-bottom: 8px; }
    .kpi-value { font-size: 24px; font-weight: 700; color: @text-primary; }
  }
  .main-tabs { background: @bg-card; border: 1px solid @border; border-radius: 12px; padding: 16px; }
  .hyperopt-status { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
  .best-params { margin-top: 16px; pre { background: #f1f5f9; padding: 12px; border-radius: 8px; font-size: 12px; } }
  .ab-header { margin-bottom: 12px; }
  .positive { color: @green !important; }
}
</style>
