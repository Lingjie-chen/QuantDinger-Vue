<template>
  <div class="composite-page" :class="{ 'theme-dark': isDarkTheme }">
    <div class="page-header"><h3>复合指标</h3><a-button @click="fetchData"><a-icon type="reload" /></a-button></div>
    <a-table :columns="columns" :data-source="indicators" :loading="loading" size="small" row-key="name" class="pro-table">
      <template slot="value" slot-scope="text, record">
        <span :class="text > 0 ? 'positive' : text < 0 ? 'negative' : ''">{{ formatNumber(text, 4) }}</span>
      </template>
    </a-table>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import request from '@/utils/request'
export function getCompositeIndicators () { return request({ url: '/api/composite/indicators', method: 'get' }) }
export default {
  name: 'CompositeIndicators',
  data () {
    return { loading: false, indicators: [],
      columns: [
        { title: '名称', dataIndex: 'name' }, { title: '值', dataIndex: 'value', scopedSlots: { customRender: 'value' } },
        { title: '说明', dataIndex: 'description' }, { title: '更新时间', dataIndex: 'updated_at', width: 160 },
      ],
    }
  },
  computed: { ...mapState({ navTheme: s => s.app.theme }), isDarkTheme () { return this.navTheme === 'dark' || this.navTheme === 'realdark' } },
  mounted () { this.fetchData() },
  methods: {
    async fetchData () {
      this.loading = true
      try { const r = await getCompositeIndicators(); this.indicators = (r.data || r) || [] }
      catch (e) { console.error(e) } finally { this.loading = false }
    },
    formatNumber (v, d = 2) { return v == null ? '—' : Number(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) },
  },
}
</script>
<style lang="less" scoped>
@bg:#f8fafc;@card:#fff;@border:#e2e8f0;@tp:#1e293b;@g:#10b981;@r:#ef4444;
.composite-page{padding:20px;background:@bg;min-height:100vh;
  .page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;h3{margin:0}}
  .main-tabs{background:@card;border:1px solid @border;border-radius:12px;padding:16px}
  .positive{color:@g!important}.negative{color:@r!important}
}
</style>
