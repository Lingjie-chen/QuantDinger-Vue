<template>
  <div :class="['page-container', { 'theme-dark': navTheme === 'dark' }]">
    <a-page-header title="A股市场" sub-title="沪深行情" />

    <a-row :gutter="16" style="margin-bottom: 16px">
      <a-col :span="6" v-for="idx in indices" :key="idx.name">
        <a-card size="small">
          <a-statistic :title="idx.name" :value="idx.price" :precision="2"
            :value-style="{ color: idx.change >= 0 ? '#3f8600' : '#cf1322' }">
            <template slot="suffix">{{ idx.change >= 0 ? '↑' : '↓' }} {{ idx.change?.toFixed(2) }}%</template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16">
      <a-col :span="12">
        <a-card title="板块涨跌榜" :bordered="false" size="small">
          <a-table :columns="sectorCols" :data-source="sectors" row-key="name" size="small" :pagination="{ pageSize: 10 }">
            <span slot="change" slot-scope="v"><span :style="{ color: v >= 0 ? '#3f8600' : '#cf1322' }">{{ v?.toFixed(2) }}%</span></span>
          </a-table>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card title="市场情绪" :bordered="false" size="small">
          <a-statistic title="情绪评分" :value="sentiment.score || 0" :precision="1" style="margin-bottom: 16px" />
          <a-statistic title="上涨家数" :value="sentiment.advance_count || 0" style="color: #3f8600" />
          <a-statistic title="下跌家数" :value="sentiment.decline_count || 0" style="margin-top: 8px; color: #cf1322" />
          <a-statistic title="涨停" :value="sentiment.limit_up || 0" style="margin-top: 8px" />
          <a-statistic title="跌停" :value="sentiment.limit_down || 0" style="margin-top: 8px" />
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getMainIndices, getSectorRankings, getMarketSentiment } from '@/api/a-stock'

export default {
  name: 'AStock',
  data() {
    return {
      indices: [],
      sectors: [],
      sentiment: {},
      sectorCols: [
        { title: '板块', dataIndex: 'name' },
        { title: '涨跌幅', dataIndex: 'change', scopedSlots: { customRender: 'change' }, sorter: (a, b) => a.change - b.change }
      ]
    }
  },
  computed: { ...mapState(['navTheme']) },
  mounted() { this.loadAll() },
  methods: {
    async loadAll() {
      try {
        const [idx, sec, sent] = await Promise.allSettled([getMainIndices(), getSectorRankings(), getMarketSentiment()])
        if (idx.status === 'fulfilled') this.indices = idx.value?.data || []
        if (sec.status === 'fulfilled') this.sectors = sec.value?.data?.sectors || []
        if (sent.status === 'fulfilled') this.sentiment = sent.value?.data || {}
      } catch (e) { this.$message.error('加载A股数据失败') }
    }
  }
}
</script>
