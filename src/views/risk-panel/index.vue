<template>
  <div class="risk-panel" :class="{ 'theme-dark': isDarkTheme }">
    <div class="kpi-grid">
      <div class="kpi-card" :class="{ 'alert-active': circuitBreakerActive }">
        <div class="kpi-label">熔断状态</div>
        <div class="kpi-value"><span :class="circuitBreakerActive ? 'negative' : 'positive'">{{ circuitBreakerActive ? '已触发' : '正常' }}</span></div>
        <div class="kpi-sub" v-if="circuitBreakerActive">{{ circuitBreaker.reason }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">今日交易</div>
        <div class="kpi-value">{{ daily.trades_today || 0 }}</div>
        <div class="kpi-sub">限额 {{ daily.max_daily_trades || '—' }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">今日亏损</div>
        <div class="kpi-value negative">${{ formatNumber(daily.daily_loss || 0) }}</div>
        <div class="kpi-sub">限额 ${{ formatNumber(daily.max_daily_loss || 0) }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">活跃告警</div>
        <div class="kpi-value" :class="(alertSummary.active_count || 0) > 0 ? 'negative' : 'positive'">{{ alertSummary.active_count || 0 }}</div>
      </div>
    </div>

    <a-tabs v-model="activeTab" class="main-tabs">
      <a-tab-pane key="alerts" tab="告警">
        <div class="alert-actions">
          <a-select v-model="alertFilter.severity" style="width:120px" placeholder="级别" allowClear>
            <a-select-option value="critical">严重</a-select-option>
            <a-select-option value="high">高</a-select-option>
            <a-select-option value="medium">中</a-select-option>
            <a-select-option value="low">低</a-select-option>
          </a-select>
          <a-select v-model="alertFilter.status" style="width:120px" placeholder="状态" allowClear>
            <a-select-option value="active">活跃</a-select-option>
            <a-select-option value="acknowledged">已确认</a-select-option>
            <a-select-option value="resolved">已解决</a-select-option>
          </a-select>
          <a-button @click="fetchAlerts"><a-icon type="reload" /></a-button>
        </div>
        <a-table :columns="alertColumns" :data-source="alerts" :loading="alertsLoading" size="small" row-key="id" class="pro-table">
          <template slot="severity" slot-scope="text"><a-tag :color="severityColor(text)">{{ text }}</a-tag></template>
          <template slot="status" slot-scope="text"><a-tag :color="text === 'active' ? 'red' : text === 'acknowledged' ? 'orange' : 'green'">{{ text }}</a-tag></template>
          <template slot="actions" slot-scope="_, record">
            <a-button v-if="record.status === 'active'" size="small" @click="ackAlert(record.id)">确认</a-button>
            <a-button v-if="record.status !== 'resolved'" size="small" type="link" @click="resolveAlertById(record.id)">解决</a-button>
          </template>
        </a-table>
      </a-tab-pane>

      <a-tab-pane key="rules" tab="风控规则">
        <a-spin :spinning="rulesLoading">
          <pre class="rules-json">{{ JSON.stringify(rules, null, 2) }}</pre>
        </a-spin>
        <a-button type="primary" @click="showRulesEditor = true" style="margin-top:12px">编辑规则</a-button>
      </a-tab-pane>

      <a-tab-pane key="assessment" tab="风险评估">
        <a-form layout="inline" class="assess-form">
          <a-form-item label="标的"><a-input v-model="assess.symbol" placeholder="BTC-USDT-SWAP" style="width:160px" /></a-form-item>
          <a-form-item label="动作"><a-select v-model="assess.action" style="width:100px"><a-select-option value="buy">买入</a-select-option><a-select-option value="sell">卖出</a-select-option></a-select></a-form-item>
          <a-form-item label="数量"><a-input-number v-model="assess.size" :min="0.001" style="width:120px" /></a-form-item>
          <a-form-item><a-button type="primary" @click="runAssessment" :loading="assessLoading">评估</a-button></a-form-item>
        </a-form>
        <div v-if="assessment" class="assess-result" :class="{ pass: assessment.allowed, fail: !assessment.allowed }">
          <h3>{{ assessment.allowed ? '通过' : '拒绝' }}</h3>
          <div v-if="assessment.reason">{{ assessment.reason }}</div>
        </div>
      </a-tab-pane>
    </a-tabs>

    <div v-if="circuitBreakerActive" class="cb-banner">
      <span>熔断器已触发: {{ circuitBreaker.reason }}</span>
      <a-button type="primary" size="small" @click="deactivateCB">解除熔断</a-button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getRiskStatus, getRiskAssessment, deactivateCircuitBreaker, listAlerts, getAlertSummary, acknowledgeAlert, resolveAlert, getRiskRules } from '@/api/risk'

export default {
  name: 'RiskPanel',
  data () {
    return {
      activeTab: 'alerts',
      statusLoading: false,
      alertsLoading: false,
      rulesLoading: false,
      assessLoading: false,
      circuitBreaker: {},
      circuitBreakerActive: false,
      daily: {},
      alertSummary: {},
      alerts: [],
      rules: {},
      showRulesEditor: false,
      alertFilter: { severity: undefined, status: undefined },
      assess: { symbol: '', action: 'buy', size: 1 },
      assessment: null,
      alertColumns: [
        { title: '时间', dataIndex: 'created_at', width: 160 },
        { title: '级别', dataIndex: 'severity', width: 80, scopedSlots: { customRender: 'severity' } },
        { title: '类别', dataIndex: 'category', width: 100 },
        { title: '标的', dataIndex: 'symbol', width: 130 },
        { title: '标题', dataIndex: 'title' },
        { title: '状态', dataIndex: 'status', width: 100, scopedSlots: { customRender: 'status' } },
        { title: '操作', width: 140, scopedSlots: { customRender: 'actions' } },
      ],
    }
  },
  computed: {
    ...mapState({ navTheme: state => state.app.theme }),
    isDarkTheme () { return this.navTheme === 'dark' || this.navTheme === 'realdark' },
  },
  mounted () { this.fetchStatus(); this.fetchAlerts(); this.fetchRules(); this.fetchAlertSummary() },
  methods: {
    async fetchStatus () {
      this.statusLoading = true
      try { const res = await getRiskStatus(); const d = res.data || res; if (d) { this.circuitBreaker = d.circuit_breaker || {}; this.circuitBreakerActive = this.circuitBreaker.is_active || false; this.daily = d.daily || {} } }
      catch (e) { console.error(e) } finally { this.statusLoading = false }
    },
    async fetchAlerts () {
      this.alertsLoading = true
      try { const res = await listAlerts(this.alertFilter); this.alerts = (res.data || res) || [] }
      catch (e) { console.error(e) } finally { this.alertsLoading = false }
    },
    async fetchAlertSummary () { try { const res = await getAlertSummary(); this.alertSummary = res.data || res || {} } catch (e) { console.error(e) } },
    async fetchRules () {
      this.rulesLoading = true
      try { const res = await getRiskRules(); this.rules = res.data || res || {} }
      catch (e) { console.error(e) } finally { this.rulesLoading = false }
    },
    async ackAlert (id) { try { await acknowledgeAlert(id); this.$message.success('已确认'); this.fetchAlerts() } catch (e) { this.$message.error('操作失败') } },
    async resolveAlertById (id) { try { await resolveAlert(id); this.$message.success('已解决'); this.fetchAlerts() } catch (e) { this.$message.error('操作失败') } },
    async deactivateCB () { try { await deactivateCircuitBreaker(); this.$message.success('熔断已解除'); this.fetchStatus() } catch (e) { this.$message.error('操作失败') } },
    async runAssessment () {
      this.assessLoading = true
      try { const res = await getRiskAssessment(this.assess); this.assessment = res.data || res }
      catch (e) { this.$message.error('评估失败') } finally { this.assessLoading = false }
    },
    severityColor (s) { return { critical: 'red', high: 'orange', medium: 'blue', low: 'green' }[s] || 'default' },
    formatNumber (v, d = 2) { return v == null ? '—' : Number(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) },
  },
}
</script>

<style lang="less" scoped>
@bg-light: #f8fafc; @bg-card: #fff; @border: #e2e8f0;
@text-primary: #1e293b; @text-secondary: #64748b; @green: #10b981; @red: #ef4444;

.risk-panel {
  padding: 20px; background: @bg-light; min-height: 100vh;
  .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px; }
  .kpi-card {
    background: @bg-card; border: 1px solid @border; border-radius: 12px; padding: 16px;
    .kpi-label { font-size: 11px; color: @text-secondary; text-transform: uppercase; margin-bottom: 8px; }
    .kpi-value { font-size: 24px; font-weight: 700; color: @text-primary; }
    .kpi-sub { font-size: 12px; color: @text-secondary; margin-top: 4px; }
    &.alert-active { border-color: @red; background: rgba(239, 68, 68, 0.04); }
  }
  .main-tabs { background: @bg-card; border: 1px solid @border; border-radius: 12px; padding: 16px; }
  .alert-actions { display: flex; gap: 8px; margin-bottom: 12px; }
  .assess-form { margin-bottom: 16px; }
  .assess-result {
    padding: 16px; border-radius: 8px; margin-top: 12px;
    &.pass { background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); }
    &.fail { background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3); }
  }
  .rules-json { background: #f1f5f9; padding: 16px; border-radius: 8px; font-size: 12px; max-height: 400px; overflow: auto; }
  .cb-banner { position: fixed; bottom: 0; left: 0; right: 0; background: @red; color: #fff; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; z-index: 100; }
  .positive { color: @green !important; }
  .negative { color: @red !important; }
}
</style>
