<template>
  <div class="table-panel">
    <div class="panel-header">
      <div class="panel-title">
        <a-icon type="history" />
        <span>{{ $t('dashboard.recentTrades') }}</span>
      </div>
    </div>
    <a-table
      :columns="columns"
      :data-source="dataSource"
      rowKey="id"
      :pagination="false"
      size="small"
      :scroll="{ x: 'max-content' }"
      class="pro-table"
    >
      <template slot="type" slot-scope="text, record">
        <span class="type-tag" :class="getTypeClass(text)">
          {{ getSignalTypeText(text) }}
        </span>
      </template>
      <template slot="profit" slot-scope="text, record">
        <span :class="text >= 0 ? 'positive' : 'negative'">
          {{ formatProfitValue(text, record) }}
        </span>
      </template>
      <template slot="time" slot-scope="text">
        <span class="time-cell">{{ formatTime(text) }}</span>
      </template>
    </a-table>
  </div>
</template>

<script>
import { formatUserDateTime } from '@/utils/userTime'

export default {
  name: 'RecentTradesTable',
  props: {
    dataSource: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    columns () {
      return [
        {
          title: this.$t('dashboard.table.time'),
          dataIndex: 'created_at',
          scopedSlots: { customRender: 'time' },
          width: 150
        },
        {
          title: this.$t('dashboard.table.symbol'),
          dataIndex: 'symbol',
          width: 100
        },
        {
          title: this.$t('dashboard.table.type'),
          dataIndex: 'type',
          scopedSlots: { customRender: 'type' },
          width: 90
        },
        {
          title: this.$t('dashboard.table.price'),
          dataIndex: 'price',
          customRender: (text) => this.formatNumber(text),
          width: 100
        },
        {
          title: this.$t('dashboard.table.profit'),
          dataIndex: 'profit',
          scopedSlots: { customRender: 'profit' },
          align: 'right',
          width: 100
        }
      ]
    }
  },
  methods: {
    formatNumber (num, digits = 2) {
      if (num === undefined || num === null) return '0.00'
      return Number(num).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
    },
    formatProfitValue (value, record) {
      if (value === null || value === undefined) return '--'
      const numValue = parseFloat(value)
      const openTypes = ['open_long', 'open_short', 'add_long', 'add_short']
      if (numValue === 0 && record && openTypes.includes(record.type)) {
        return '--'
      }
      if (Math.abs(numValue) < 0.000001) {
        if (record && openTypes.includes(record.type)) {
          return '--'
        }
        return '$0.00'
      }
      const sign = numValue >= 0 ? '+' : ''
      return `${sign}$${this.formatNumber(numValue)}`
    },
    getTypeClass (type) {
      if (!type) return ''
      const t = type.toLowerCase()
      if (t.includes('open_long') || t.includes('add_long')) return 'long'
      if (t.includes('open_short') || t.includes('add_short')) return 'short'
      if (t.includes('close_long')) return 'close-long'
      if (t.includes('close_short')) return 'close-short'
      return ''
    },
    getSignalTypeText (type) {
      if (!type) return '-'
      const typeMap = {
        'open_long': this.$t('dashboard.signalType.openLong'),
        'open_short': this.$t('dashboard.signalType.openShort'),
        'close_long': this.$t('dashboard.signalType.closeLong'),
        'close_short': this.$t('dashboard.signalType.closeShort'),
        'add_long': this.$t('dashboard.signalType.addLong'),
        'add_short': this.$t('dashboard.signalType.addShort')
      }
      return typeMap[type.toLowerCase()] || type.toUpperCase()
    },
    formatTime (timestamp) {
      if (!timestamp) return '-'
      const loc = (this.$i18n && this.$i18n.locale) ? this.$i18n.locale : 'zh-CN'
      const s = formatUserDateTime(timestamp, { locale: loc, fallback: '-' })
      return s || '-'
    }
  }
}
</script>
