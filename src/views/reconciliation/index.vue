<template>
  <div class="reconciliation-page" :class="{ 'theme-dark': isDarkTheme }">
    <div class="page-header"><h3>对账管理</h3>
      <div><a-button type="primary" @click="trigger" :loading="triggering">触发对账</a-button><a-button @click="fetchData"><a-icon type="reload" /></a-button></div>
    </div>
    <a-tabs v-model="activeTab">
      <a-tab-pane key="discrepancies" tab="差异项">
        <a-table :columns="discColumns" :data-source="discrepancies" :loading="loading" size="small" row-key="id" class="pro-table">
          <template slot="actions" slot-scope="_, r">
            <a-button v-if="r.status !== 'resolved'" size="small" type="primary" @click="resolve(r.id)">标记解决</a-button>
          </template>
        </a-table>
      </a-tab-pane>
      <a-tab-pane key="history" tab="历史记录">
        <a-table :columns="histColumns" :data-source="history" size="small" row-key="id" class="pro-table" />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import { getDiscrepancies, triggerReconciliation, resolveDiscrepancy, getReconciliationHistory } from '@/api/reconciliation'
export default {
  name: 'Reconciliation',
  data () {
    return { loading: false, triggering: false, activeTab: 'discrepancies', discrepancies: [], history: [],
      discColumns: [
        { title: 'ID', dataIndex: 'id', width: 60 }, { title: '标的', dataIndex: 'symbol', width: 130 },
        { title: '类型', dataIndex: 'type', width: 100 }, { title: '差异', dataIndex: 'difference', width: 120 },
        { title: '状态', dataIndex: 'status', width: 80 }, { title: '操作', width: 120, scopedSlots: { customRender: 'actions' } },
      ],
      histColumns: [
        { title: '时间', dataIndex: 'timestamp', width: 160 }, { title: '类型', dataIndex: 'type', width: 100 },
        { title: '结果', dataIndex: 'result' },
      ],
    }
  },
  computed: { ...mapState({ navTheme: s => s.app.theme }), isDarkTheme () { return this.navTheme === 'dark' || this.navTheme === 'realdark' } },
  mounted () { this.fetchData() },
  methods: {
    async fetchData () {
      this.loading = true
      try {
        const [d, h] = await Promise.all([getDiscrepancies(), getReconciliationHistory()])
        this.discrepancies = (d.data || d) || []; this.history = (h.data || h) || []
      } catch (e) { console.error(e) } finally { this.loading = false }
    },
    async trigger () { this.triggering = true; try { await triggerReconciliation(); this.$message.success('对账已触发'); this.fetchData() } catch (e) { this.$message.error('触发失败') } finally { this.triggering = false } },
    async resolve (id) { try { await resolveDiscrepancy(id, { status: 'resolved' }); this.$message.success('已解决'); this.fetchData() } catch (e) { this.$message.error('操作失败') } },
  },
}
</script>
<style lang="less" scoped>
@bg:#f8fafc;@card:#fff;@border:#e2e8f0;
.reconciliation-page{padding:24px;background:@bg;min-height:100vh;
  .page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;h3{margin:0}}
}
</style>
