<template>
  <div class="evolution-engine" :class="{ 'theme-dark': isDarkTheme }">
    <a-tabs v-model="activeTab" class="main-tabs">
      <a-tab-pane key="dashboard" tab="进化仪表盘">
        <div class="kpi-grid">
          <div class="kpi-card"><div class="kpi-label">进化状态</div><div class="kpi-value">{{ (dashboard.auto_evolver || {}).status || '—' }}</div></div>
          <div class="kpi-card"><div class="kpi-label">因子数量</div><div class="kpi-value">{{ (dashboard.auto_evolver || {}).factors_count || 0 }}</div></div>
          <div class="kpi-card"><div class="kpi-label">超参状态</div><div class="kpi-value">{{ (dashboard.hyperopt || {}).status || '—' }}</div></div>
          <div class="kpi-card"><div class="kpi-label">沙盒状态</div><div class="kpi-value">{{ (dashboard.sandbox || {}).status || '—' }}</div></div>
        </div>
      </a-tab-pane>

      <a-tab-pane key="hyperopt" tab="超参优化">
        <div class="hyperopt-panel">
          <div class="hyperopt-status">
            <span>状态:</span>
            <a-tag :color="hyperopt.status === 'running' ? 'blue' : 'default'">{{ hyperopt.status === 'running' ? '运行中' : (hyperopt.status === 'completed' ? '已完成' : '空闲') }}</a-tag>
            <span v-if="hyperopt.trials != null">试验次数: {{ hyperopt.trials }}</span>
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
              <a-button v-if="hyperopt.status !== 'running'" type="primary" @click="startHyperopt">开始优化</a-button>
              <a-button v-else danger @click="stopHyperoptRun">停止</a-button>
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
          <a-descriptions-item label="运行实验数">{{ sandbox.running_experiments || 0 }}</a-descriptions-item>
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
      hyperopt: { status: 'idle', trials: 0, best_params: null },
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
@import '@/assets/design-tokens.less';

.evolution-engine {
  padding: @qd-space-lg; background: @qd-bg-light; min-height: 100vh;
  &.theme-dark { background: @qd-bg-dark; }
  .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: @qd-space-md; margin-bottom: @qd-space-md; }
  .kpi-card { .qd-card-base();
    .kpi-label { .qd-kpi-label(); }
    .kpi-value { font-size: @qd-font-xl; font-weight: @qd-font-bold; color: @qd-text-primary-light; }
  }
  .main-tabs { background: @qd-bg-card-light; border: 1px solid @qd-border-light; border-radius: @qd-radius-lg; padding: @qd-space-md; }
  .hyperopt-status { display: flex; align-items: center; gap: @qd-space-md; margin-bottom: @qd-space-md; }
  .best-params { margin-top: @qd-space-md; pre { background: @qd-bg-light; padding: @qd-space-md; border-radius: @qd-radius-md; font-size: @qd-font-sm; } }
  .ab-header { margin-bottom: @qd-space-md; }
  .positive { .qd-positive-text(); }
}
</style>
