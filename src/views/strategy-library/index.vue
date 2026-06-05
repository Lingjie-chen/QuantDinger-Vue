<template>
  <div :class="['page-container', { 'theme-dark': navTheme === 'dark' }]">
    <a-page-header title="策略库" sub-title="Strategy Library" />

    <a-tabs default-active-key="active">
      <a-tab-pane key="active" tab="已上线策略">
        <a-table :columns="activeCols" :data-source="activeStrategies" row-key="strategy_id" size="small" :loading="loading" :pagination="{ pageSize: 10 }">
          <span slot="status" slot-scope="v"><a-badge :status="v === 'running' ? 'processing' : 'default'" :text="v" /></span>
          <span slot="sharpe" slot-scope="v">{{ v?.toFixed(2) || '--' }}</span>
        </a-table>
      </a-tab-pane>
      <a-tab-pane key="candidates" tab="候选策略">
        <a-table :columns="candCols" :data-source="candidates" row-key="id" size="small" :loading="loading" :pagination="{ pageSize: 10 }">
          <span slot="action" slot-scope="_, r">
            <a-button type="link" size="small" @click="handleQualify(r)">资质认证</a-button>
            <a-button type="link" size="small" @click="handleActivate(r)" :disabled="r.qualified !== true">上线</a-button>
          </span>
        </a-table>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { listStrategies, listCandidates, getActiveStrategies, qualifyStrategy, activateStrategy } from '@/api/strategy-library'

export default {
  name: 'StrategyLibrary',
  data() {
    return {
      loading: false,
      activeStrategies: [],
      candidates: [],
      activeCols: [
        { title: '策略ID', dataIndex: 'strategy_id' },
        { title: '名称', dataIndex: 'name' },
        { title: '状态', dataIndex: 'status', scopedSlots: { customRender: 'status' } },
        { title: 'Sharpe', dataIndex: 'sharpe', scopedSlots: { customRender: 'sharpe' } },
        { title: '最大回撤', dataIndex: 'max_drawdown' },
        { title: '收益', dataIndex: 'return_pct' }
      ],
      candCols: [
        { title: '名称', dataIndex: 'name' },
        { title: '类型', dataIndex: 'strategy_type' },
        { title: '已认证', dataIndex: 'qualified' },
        { title: '回测Sharpe', dataIndex: 'backtest_sharpe' },
        { title: '操作', scopedSlots: { customRender: 'action' } }
      ]
    }
  },
  computed: { ...mapState(['navTheme']) },
  mounted() { this.loadAll() },
  methods: {
    async loadAll() {
      this.loading = true
      try {
        const [active, cands] = await Promise.allSettled([getActiveStrategies(), listCandidates()])
        if (active.status === 'fulfilled') this.activeStrategies = active.value?.data || []
        if (cands.status === 'fulfilled') this.candidates = cands.value?.data || []
      } finally { this.loading = false }
    },
    handleQualify(record) {
      this.$confirm({ title: `资质认证: ${record.name}`, onOk: () => qualifyStrategy({ candidate_id: record.id }).then(() => this.loadAll()) })
    },
    handleActivate(record) {
      this.$confirm({ title: `上线策略: ${record.name}`, onOk: () => activateStrategy({ candidate_id: record.id }).then(() => this.loadAll()) })
    }
  }
}
</script>
