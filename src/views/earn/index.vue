<template>
  <div :class="['page-container', { 'theme-dark': navTheme === 'dark' }]">
    <a-page-header title="理财产品" sub-title="OKX Earn" />

    <a-tabs default-active-key="products">
      <a-tab-pane key="products" tab="产品列表">
        <a-table :columns="prodCols" :data-source="products" row-key="product_id" size="small" :loading="loading" :pagination="{ pageSize: 10 }">
          <span slot="annual_rate" slot-scope="v"><a-tag color="green">{{ v }}%</a-tag></span>
          <span slot="action" slot-scope="_, r">
            <a-button type="link" size="small" @click="handleSubscribe(r)">认购</a-button>
          </span>
        </a-table>
      </a-tab-pane>
      <a-tab-pane key="positions" tab="我的持仓">
        <a-table :columns="posCols" :data-source="positions" row-key="id" size="small" :loading="loading" :pagination="false">
          <span slot="action" slot-scope="_, r">
            <a-button type="link" size="small" @click="handleRedeem(r)">赎回</a-button>
          </span>
        </a-table>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { listEarnProducts, getEarnPositions, subscribeEarn, redeemEarn } from '@/api/earn'

export default {
  name: 'Earn',
  data() {
    return {
      loading: false,
      products: [],
      positions: [],
      prodCols: [
        { title: '产品', dataIndex: 'product_name' },
        { title: '币种', dataIndex: 'coin' },
        { title: '年化', dataIndex: 'annual_rate', scopedSlots: { customRender: 'annual_rate' } },
        { title: '期限', dataIndex: 'period' },
        { title: '操作', scopedSlots: { customRender: 'action' } }
      ],
      posCols: [
        { title: '产品', dataIndex: 'product_name' },
        { title: '币种', dataIndex: 'coin' },
        { title: '数量', dataIndex: 'amount' },
        { title: '收益', dataIndex: 'earnings' },
        { title: '状态', dataIndex: 'status' },
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
        const [prods, pos] = await Promise.allSettled([listEarnProducts(), getEarnPositions()])
        if (prods.status === 'fulfilled') this.products = prods.value?.data || []
        if (pos.status === 'fulfilled') this.positions = pos.value?.data || []
      } finally { this.loading = false }
    },
    handleSubscribe(record) {
      this.$confirm({ title: `认购 ${record.product_name}`, onOk: () => subscribeEarn({ product_id: record.product_id }).then(() => this.loadAll()) })
    },
    handleRedeem(record) {
      this.$confirm({ title: `赎回 ${record.product_name}`, onOk: () => redeemEarn({ position_id: record.id }).then(() => this.loadAll()) })
    }
  }
}
</script>
