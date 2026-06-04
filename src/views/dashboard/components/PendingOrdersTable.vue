<template>
  <div class="chart-panel orders-panel">
    <div class="panel-header">
      <div class="panel-title">
        <a-icon type="unordered-list" />
        <span>{{ $t('dashboard.pendingOrders') }}</span>
        <a-tooltip :title="soundEnabled ? $t('dashboard.clickToMute') : $t('dashboard.clickToUnmute')">
          <a-icon
            :type="soundEnabled ? 'sound' : 'audio-muted'"
            class="sound-toggle"
            :class="{ 'sound-off': !soundEnabled }"
            @click="handleToggleSound"
          />
        </a-tooltip>
      </div>
      <div class="panel-badge">{{ totalCount }}</div>
    </div>
    <a-table
      :columns="columns"
      :data-source="dataSource"
      rowKey="id"
      :pagination="paginationConfig"
      size="small"
      :loading="loading"
      :scroll="{ x: 1200 }"
      class="pro-table"
      @change="handleChange"
    >
      <template slot="strategy_name" slot-scope="text, record">
        <div class="symbol-cell">
          <span class="symbol-name">{{ text || '-' }}</span>
          <span class="symbol-strategy">ID: {{ record.strategy_id }}</span>
        </div>
      </template>
      <template slot="symbol" slot-scope="text">
        <span class="symbol-tag">{{ text }}</span>
      </template>
      <template slot="signal_type" slot-scope="text">
        <span class="type-tag" :class="getTypeClass(text)">
          {{ getSignalTypeText(text) }}
        </span>
      </template>
      <template slot="exchange" slot-scope="text, record">
        <span
          v-if="(record && (record.exchange_display || record.exchange_id || text))"
          class="exchange-tag"
          :class="(record.exchange_display || record.exchange_id || text).toLowerCase()"
        >
          {{ String(record.exchange_display || record.exchange_id || text).toUpperCase() }}
        </span>
        <span v-else class="text-muted">-</span>
        <div v-if="record && record.market_type" class="market-type">
          {{ String(record.market_type).toUpperCase() }}
        </div>
      </template>
      <template slot="notify" slot-scope="text, record">
        <div class="notify-icons">
          <a-tooltip
            v-for="ch in (record && record.notify_channels ? record.notify_channels : [])"
            :key="`${record.id}-${ch}`"
            :title="String(ch)"
          >
            <a-icon :type="getNotifyIconType(ch)" class="notify-icon" />
          </a-tooltip>
          <span v-if="!record || !record.notify_channels || record.notify_channels.length === 0" class="text-muted">-</span>
        </div>
      </template>
      <template slot="status" slot-scope="text, record">
        <span class="status-tag" :class="text">
          {{ getStatusText(text) }}
        </span>
        <div v-if="text === 'failed' && record.error_message" class="error-hint">
          <a-tooltip :title="record.error_message">
            <a-icon type="exclamation-circle" />
            <span>{{ $t('dashboard.viewError') }}</span>
          </a-tooltip>
        </div>
      </template>
      <template slot="amount" slot-scope="text, record">
        <div>{{ formatNumber(text, 8) }}</div>
        <div v-if="record.filled_amount" class="sub-text">
          {{ $t('dashboard.filled') }}: {{ formatNumber(record.filled_amount, 8) }}
        </div>
      </template>
      <template slot="price" slot-scope="text, record">
        <div v-if="record.filled_price">{{ formatNumber(record.filled_price) }}</div>
        <div v-else class="text-muted">-</div>
      </template>
      <template slot="time_info" slot-scope="text, record">
        <div class="time-cell">{{ formatTime(record.created_at) }}</div>
        <div v-if="record.executed_at" class="sub-text">
          {{ formatTime(record.executed_at) }}
        </div>
      </template>
    </a-table>
  </div>
</template>

<script>
import { formatUserDateTime } from '@/utils/userTime'

export default {
  name: 'PendingOrdersTable',
  props: {
    dataSource: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    pagination: {
      type: Object,
      default: () => ({
        current: 1,
        pageSize: 20,
        total: 0
      })
    },
    soundEnabled: {
      type: Boolean,
      default: true
    },
    strategyFilters: {
      type: Array,
      default: () => []
    },
    totalCount: {
      type: Number,
      default: 0
    }
  },
  computed: {
    columns () {
      return [
        {
          title: this.$t('dashboard.orderTable.strategy'),
          dataIndex: 'strategy_name',
          scopedSlots: { customRender: 'strategy_name' },
          filters: this.strategyFilters,
          filterMultiple: true,
          onFilter: (value, record) => String(record && record.strategy_id) === String(value),
          width: 150
        },
        {
          title: this.$t('dashboard.orderTable.exchange'),
          dataIndex: 'exchange_id',
          scopedSlots: { customRender: 'exchange' },
          width: 120
        },
        {
          title: this.$t('dashboard.orderTable.notify'),
          dataIndex: 'notify_channels',
          scopedSlots: { customRender: 'notify' },
          width: 100
        },
        {
          title: this.$t('dashboard.orderTable.symbol'),
          dataIndex: 'symbol',
          scopedSlots: { customRender: 'symbol' },
          width: 110
        },
        {
          title: this.$t('dashboard.orderTable.signalType'),
          dataIndex: 'signal_type',
          scopedSlots: { customRender: 'signal_type' },
          width: 100
        },
        {
          title: this.$t('dashboard.orderTable.amount'),
          dataIndex: 'amount',
          scopedSlots: { customRender: 'amount' },
          width: 130
        },
        {
          title: this.$t('dashboard.orderTable.price'),
          dataIndex: 'filled_price',
          scopedSlots: { customRender: 'price' },
          width: 100
        },
        {
          title: this.$t('dashboard.orderTable.status'),
          dataIndex: 'status',
          scopedSlots: { customRender: 'status' },
          width: 130
        },
        {
          title: this.$t('dashboard.orderTable.timeInfo'),
          dataIndex: 'created_at',
          scopedSlots: { customRender: 'time_info' },
          width: 160
        }
      ]
    },
    paginationConfig () {
      return {
        current: this.pagination.current,
        pageSize: this.pagination.pageSize,
        total: this.pagination.total,
        showSizeChanger: true,
        size: 'small',
        showTotal: (total) => this.$t('dashboard.totalOrders', { total })
      }
    }
  },
  methods: {
    handleChange (pag) {
      this.$emit('change', pag)
    },
    handleToggleSound () {
      this.$emit('toggleSound')
    },
    // ========== 格式化 ==========
    formatNumber (num, digits = 2) {
      if (num === undefined || num === null) return '0.00'
      return Number(num).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
    },
    formatTime (timestamp) {
      if (!timestamp) return '-'
      const loc = (this.$i18n && this.$i18n.locale) ? this.$i18n.locale : 'zh-CN'
      const s = formatUserDateTime(timestamp, { locale: loc, fallback: '-' })
      return s || '-'
    },
    // ========== 信号类型 ==========
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
    // ========== 状态 ==========
    getStatusText (status) {
      if (!status) return '-'
      const statusMap = {
        'pending': this.$t('dashboard.status.pending'),
        'processing': this.$t('dashboard.status.processing'),
        'completed': this.$t('dashboard.status.completed'),
        'failed': this.$t('dashboard.status.failed'),
        'cancelled': this.$t('dashboard.status.cancelled')
      }
      return statusMap[status.toLowerCase()] || status.toUpperCase()
    },
    // ========== 通知图标 ==========
    getNotifyIconType (channel) {
      const c = String(channel || '').trim().toLowerCase()
      const map = {
        browser: 'bell',
        webhook: 'link',
        discord: 'comment',
        telegram: 'message',
        tg: 'message',
        tele: 'message',
        email: 'mail',
        phone: 'phone'
      }
      return map[c] || 'notification'
    }
  }
}
</script>
