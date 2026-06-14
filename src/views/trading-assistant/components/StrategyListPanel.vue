<template>
  <a-card :bordered="false" class="strategy-list-card">
    <div slot="title" class="card-title">
      <span>{{ $t('trading-assistant.strategyList') }}</span>
      <a-button type="primary" size="small" @click="$emit('create')">
        <a-icon type="plus" />
        {{ $t('trading-assistant.createStrategy') }}
      </a-button>
    </div>

    <!-- 分组方式切换 -->
    <div class="group-mode-switch">
      <span class="group-mode-label">{{ $t('trading-assistant.groupBy') }}:</span>
      <a-radio-group :value="groupByMode" @change="(e) => $emit('update:groupByMode', e.target.value)" size="small" button-style="solid">
        <a-radio-button value="strategy">
          <a-icon type="folder" />
          {{ $t('trading-assistant.groupByStrategy') }}
        </a-radio-button>
        <a-radio-button value="symbol">
          <a-icon type="stock" />
          {{ $t('trading-assistant.groupBySymbol') }}
        </a-radio-button>
      </a-radio-group>
    </div>

    <a-spin :spinning="loading">
      <div v-if="!loading && strategies.length === 0" class="strategy-empty-state">
        <a-empty :description="$t('trading-assistant.empty.title')" />
        <div class="strategy-empty-desc">{{ $t('trading-assistant.empty.desc') }}</div>
        <a-button type="primary" @click="$emit('create')">
          <a-icon type="plus" />
          {{ $t('trading-assistant.empty.primary') }}
        </a-button>
      </div>
      <div v-else class="strategy-grouped-list">
        <!-- 策略组列表 -->
        <div v-for="group in computedGroupedStrategies.groups" :key="group.id" class="strategy-group">
          <!-- 策略组头部 -->
          <div class="strategy-group-header" @click="toggleGroup(group.id)">
            <div class="group-header-left">
              <a-icon :type="collapsedGroups[group.id] ? 'right' : 'down'" class="collapse-icon" />
              <a-icon :type="groupByMode === 'symbol' ? 'stock' : 'folder'" class="group-icon" />
              <span class="group-name">{{ group.baseName }}</span>
              <a-tag size="small" color="blue">{{ group.strategies.length }} {{
                groupByMode === 'symbol' ? $t('trading-assistant.strategyCount') : $t('trading-assistant.symbolCount') }}</a-tag>
            </div>
            <div class="group-header-right" @click.stop>
              <span v-if="group.runningCount > 0" class="group-status running">
                {{ group.runningCount }} {{ $t('trading-assistant.status.running') }}
              </span>
              <span v-if="group.stoppedCount > 0" class="group-status stopped">
                {{ group.stoppedCount }} {{ $t('trading-assistant.status.stopped') }}
              </span>
              <a-dropdown :getPopupContainer="getDropdownContainer" :trigger="['click']">
                <a-menu slot="overlay" @click="({ key }) => $emit('group-menu-click', key, group)">
                  <a-menu-item key="startAll">
                    <a-icon type="play-circle" />
                    {{ $t('trading-assistant.startAll') }}
                  </a-menu-item>
                  <a-menu-item key="stopAll">
                    <a-icon type="pause-circle" />
                    {{ $t('trading-assistant.stopAll') }}
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item key="deleteAll" class="danger-item">
                    <a-icon type="delete" />
                    {{ $t('trading-assistant.deleteAll') }}
                  </a-menu-item>
                </a-menu>
                <a-button type="link" icon="more" size="small" />
              </a-dropdown>
            </div>
          </div>
          <!-- 策略组内的策略列表（可折叠） -->
          <div v-show="!collapsedGroups[group.id]" class="strategy-group-content">
            <div
              v-for="item in group.strategies"
              :key="item.id"
              :class="[
                'strategy-list-item',
                { active: selectedStrategy && selectedStrategy.id === item.id },
                { 'strategy-list-item--strategy-group': groupByMode === 'strategy' }
              ]"
              @click="$emit('select', item)">
              <div class="strategy-item-content">
                <div class="strategy-item-header">
                  <div :class="['strategy-name-wrapper', { 'strategy-name-wrapper--grouped': groupByMode === 'symbol' }]">
                    <template v-if="groupByMode === 'strategy'">
                      <span class="strategy-name">{{ item.strategy_name }}</span>
                      <a-tag
                        v-if="item.strategy_type === 'PromptBasedStrategy'"
                        color="purple"
                        size="small"
                        class="strategy-type-tag">
                        <a-icon type="robot" style="margin-right: 2px;" />
                        AI
                      </a-tag>
                      <a-tag v-if="item.strategy_mode === 'script'" size="small" color="green" style="margin-left: 4px;">
                        <a-icon type="code" style="margin-right: 2px;" />{{ $t('trading-assistant.strategyMode.script') }}
                      </a-tag>
                      <a-tag
                        v-if="item.strategy_mode === 'script' && scriptTemplateKeyOf(item)"
                        size="small"
                        color="blue"
                        style="margin-left: 4px;">
                        {{ scriptTemplateLabel(scriptTemplateKeyOf(item)) }}
                      </a-tag>
                      <a-tag
                        v-if="isCrossSectionalStrategy(item)"
                        size="small"
                        color="orange"
                        style="margin-left: 4px;">
                        {{ $t('trading-assistant.tag.crossSectional') }}
                      </a-tag>
                    </template>
                    <template v-else>
                      <span class="info-item strategy-name-text">
                        <a-icon type="thunderbolt" />
                        {{ item.displayInfo ? item.displayInfo.strategyName : item.strategy_name }}
                      </span>
                      <a-tag size="small" color="cyan" v-if="item.displayInfo && item.displayInfo.timeframe">
                        <a-icon type="clock-circle" style="margin-right: 2px;" />
                        {{ item.displayInfo.timeframe }}
                      </a-tag>
                      <a-tag size="small" color="purple" v-if="item.displayInfo && item.displayInfo.indicatorName && item.displayInfo.indicatorName !== '-'">
                        <a-icon type="line-chart" style="margin-right: 2px;" />
                        {{ item.displayInfo.indicatorName }}
                      </a-tag>
                      <a-tag v-if="item.strategy_mode === 'script'" size="small" color="green" style="margin-left: 4px;">
                        <a-icon type="code" style="margin-right: 2px;" />{{ $t('trading-assistant.strategyMode.script') }}
                      </a-tag>
                      <a-tag
                        v-if="item.strategy_mode === 'script' && scriptTemplateKeyOf(item)"
                        size="small"
                        color="blue"
                        style="margin-left: 4px;">
                        {{ scriptTemplateLabel(scriptTemplateKeyOf(item)) }}
                      </a-tag>
                    </template>
                  </div>
                </div>
                <div class="strategy-item-info">
                  <template v-if="groupByMode === 'strategy'">
                    <span class="info-item" v-if="item.trading_config && item.trading_config.symbol">
                      <a-icon type="dollar" />
                      {{ item.trading_config.symbol }}
                    </span>
                    <span
                      class="info-item"
                      v-if="item.exchange_config && item.exchange_config.exchange_id">
                      <a-icon type="bank" />
                      {{ getExchangeDisplayName(item.exchange_config.exchange_id) }}
                    </span>
                    <span class="info-item" v-if="item.trading_config && item.trading_config.timeframe">
                      <a-icon type="clock-circle" />
                      {{ item.trading_config.timeframe }}
                    </span>
                  </template>
                  <span
                    class="status-label"
                    :class="[
                      item.status ? `status-${item.status}` : '',
                      { 'status-stopped': item.status === 'stopped' }
                    ]">
                    {{ getStatusText(item.status) }}
                  </span>
                </div>
              </div>
              <div class="strategy-item-actions" @click.stop>
                <a-dropdown :getPopupContainer="getDropdownContainer" :trigger="['click']">
                  <a-menu slot="overlay" @click="({ key }) => $emit('menu-click', key, item)">
                    <a-menu-item v-if="item.status === 'stopped'" key="start">
                      <a-icon type="play-circle" />
                      {{ $t('trading-assistant.startStrategy') }}
                    </a-menu-item>
                    <a-menu-item v-if="item.status === 'running'" key="stop">
                      <a-icon type="pause-circle" />
                      {{ $t('trading-assistant.stopStrategy') }}
                    </a-menu-item>
                    <a-menu-divider />
                    <a-menu-item key="edit">
                      <a-icon type="edit" />
                      {{ $t('trading-assistant.editStrategy') }}
                    </a-menu-item>
                    <a-menu-item key="backtest">
                      <a-icon type="experiment" />
                      {{ $t('dashboard.indicator.action.backtest') }}
                    </a-menu-item>
                    <a-menu-divider />
                    <a-menu-item key="delete" class="danger-item">
                      <a-icon type="delete" />
                      {{ $t('trading-assistant.deleteStrategy') }}
                    </a-menu-item>
                  </a-menu>
                  <a-button type="link" icon="more" size="small" />
                </a-dropdown>
              </div>
            </div>
          </div>
        </div>

        <!-- 未分组的策略列表 -->
        <div
          v-for="item in computedGroupedStrategies.ungrouped"
          :key="item.id"
          :class="['strategy-list-item', { active: selectedStrategy && selectedStrategy.id === item.id }]"
          @click="$emit('select', item)">
          <div class="strategy-item-content">
            <div class="strategy-item-header">
              <div class="strategy-name-wrapper">
                <a-tag
                  v-if="item.exchange_config && item.exchange_config.exchange_id"
                  :color="getExchangeTagColor(item.exchange_config.exchange_id)"
                  size="small"
                  class="exchange-tag">
                  <a-icon type="bank" style="margin-right: 4px;" />
                  {{ getExchangeDisplayName(item.exchange_config.exchange_id) }}
                </a-tag>
                <span class="strategy-name">{{ item.strategy_name }}</span>
                <a-tag
                  v-if="item.strategy_type === 'PromptBasedStrategy'"
                  color="purple"
                  size="small"
                  class="strategy-type-tag">
                  <a-icon type="robot" style="margin-right: 2px;" />
                  AI
                </a-tag>
                <a-tag v-if="item.strategy_mode === 'script'" size="small" color="green" style="margin-left: 4px;">
                  <a-icon type="code" style="margin-right: 2px;" />{{ $t('trading-assistant.strategyMode.script') }}
                </a-tag>
                <a-tag
                  v-if="item.strategy_mode === 'script' && scriptTemplateKeyOf(item)"
                  size="small"
                  color="blue"
                  style="margin-left: 4px;">
                  {{ scriptTemplateLabel(scriptTemplateKeyOf(item)) }}
                </a-tag>
                <a-tag
                  v-if="isCrossSectionalStrategy(item)"
                  size="small"
                  color="orange"
                  style="margin-left: 4px;">
                  {{ $t('trading-assistant.tag.crossSectional') }}
                </a-tag>
              </div>
            </div>
            <div class="strategy-item-info">
              <span class="info-item" v-if="item.trading_config && item.trading_config.symbol">
                <a-icon type="dollar" />
                {{ item.trading_config.symbol }}
              </span>
              <span
                class="status-label"
                :class="[
                  item.status ? `status-${item.status}` : '',
                  { 'status-stopped': item.status === 'stopped' }
                ]">
                {{ getStatusText(item.status) }}
              </span>
            </div>
          </div>
          <div class="strategy-item-actions" @click.stop>
            <a-dropdown :getPopupContainer="getDropdownContainer" :trigger="['click']">
              <a-menu slot="overlay" @click="({ key }) => $emit('menu-click', key, item)">
                <a-menu-item v-if="item.status === 'stopped'" key="start">
                  <a-icon type="play-circle" />
                  {{ $t('trading-assistant.startStrategy') }}
                </a-menu-item>
                <a-menu-item v-if="item.status === 'running'" key="stop">
                  <a-icon type="pause-circle" />
                  {{ $t('trading-assistant.stopStrategy') }}
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="edit">
                  <a-icon type="edit" />
                  {{ $t('trading-assistant.editStrategy') }}
                </a-menu-item>
                <a-menu-item key="backtest">
                  <a-icon type="experiment" />
                  {{ $t('dashboard.indicator.action.backtest') }}
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="delete" class="danger-item">
                  <a-icon type="delete" />
                  {{ $t('trading-assistant.deleteStrategy') }}
                </a-menu-item>
              </a-menu>
              <a-button type="link" icon="more" size="small" />
            </a-dropdown>
          </div>
        </div>
      </div>
    </a-spin>
  </a-card>
</template>

<script>
export default {
  name: 'StrategyListPanel',
  props: {
    strategies: {
      type: Array,
      default: () => []
    },
    selectedStrategy: {
      type: Object,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    },
    groupByMode: {
      type: String,
      default: 'strategy'
    },
    collapsedGroups: {
      type: Object,
      default: () => ({})
    },
    exchangeOptions: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    computedGroupedStrategies () {
      if (this.groupByMode === 'symbol') {
        return this.groupedBySymbol
      }
      return this.groupedByStrategy
    },
    // 按策略分组
    groupedByStrategy () {
      const groups = {}
      const ungrouped = []

      for (const s of this.strategies) {
        const groupId = s.strategy_group_id
        if (groupId && groupId.trim()) {
          if (!groups[groupId]) {
            groups[groupId] = {
              id: groupId,
              baseName: s.group_base_name || s.strategy_name.split('-')[0],
              strategies: [],
              runningCount: 0,
              stoppedCount: 0
            }
          }
          groups[groupId].strategies.push(s)
          if (s.status === 'running') {
            groups[groupId].runningCount++
          } else {
            groups[groupId].stoppedCount++
          }
        } else {
          ungrouped.push(s)
        }
      }

      const groupList = Object.values(groups).sort((a, b) => {
        const aTime = Math.max(...a.strategies.map(s => s.created_at || 0))
        const bTime = Math.max(...b.strategies.map(s => s.created_at || 0))
        return bTime - aTime
      })

      return { groups: groupList, ungrouped }
    },
    // 按 Symbol 分组
    groupedBySymbol () {
      const groups = {}
      const ungrouped = []

      for (const s of this.strategies) {
        const tc = s.trading_config || {}
        const symbol = tc.symbol
        if (symbol && symbol.trim()) {
          if (!groups[symbol]) {
            groups[symbol] = {
              id: `symbol_${symbol}`,
              baseName: symbol,
              strategies: [],
              runningCount: 0,
              stoppedCount: 0
            }
          }
          const strategyInfo = {
            ...s,
            displayInfo: {
              strategyName: s.strategy_name || s.group_base_name || 'Unnamed',
              timeframe: tc.timeframe || '-',
              indicatorName: s.indicator_name || (s.indicator_config && s.indicator_config.name) || '-'
            }
          }
          groups[symbol].strategies.push(strategyInfo)
          if (s.status === 'running') {
            groups[symbol].runningCount++
          } else {
            groups[symbol].stoppedCount++
          }
        } else {
          ungrouped.push(s)
        }
      }

      const groupList = Object.values(groups).sort((a, b) => {
        return a.baseName.localeCompare(b.baseName)
      })

      return { groups: groupList, ungrouped }
    }
  },
  methods: {
    toggleGroup (groupId) {
      const updated = { ...this.collapsedGroups }
      updated[groupId] = !updated[groupId]
      this.$emit('update:collapsedGroups', updated)
    },
    getDropdownContainer () {
      return document.body
    },
    getStatusText (status) {
      return this.$t(`trading-assistant.status.${status}`) || status
    },
    isCrossSectionalStrategy (strategy) {
      const tc = (strategy && strategy.trading_config) || {}
      return (tc.cs_strategy_type || '') === 'cross_sectional'
    },
    scriptTemplateKeyOf (item) {
      if (!item || !item.trading_config) return ''
      const k = item.trading_config.script_template_key
      return k ? String(k) : ''
    },
    scriptTemplateLabel (key) {
      if (!key) return ''
      const i18nKey = `trading-assistant.template.${key}`
      const t = this.$t(i18nKey)
      return t !== i18nKey ? t : String(key)
    },
    getExchangeDisplayName (exchangeId) {
      if (!exchangeId) return ''
      const exchange = this.exchangeOptions.find(ex => ex.value === exchangeId)
      if (exchange) {
        if (exchange.labelKey) {
          const translationKey = `trading-assistant.exchangeNames.${exchange.labelKey}`
          const translated = this.$t(translationKey)
          if (translated !== translationKey) {
            return translated
          }
        }
        return exchange.label || exchange.value
      }
      return exchangeId.charAt(0).toUpperCase() + exchangeId.slice(1)
    },
    getExchangeTagColor (exchangeId) {
      const colorMap = {
        binance: 'gold',
        okx: 'blue',
        coinbaseexchange: 'cyan',
        kraken: 'purple',
        huobi: 'orange',
        gate: 'green',
        mexc: 'lime',
        kucoin: 'volcano',
        bybit: 'red',
        bitget: 'magenta',
        bitmex: 'red',
        deribit: 'blue',
        phemex: 'cyan',
        bitmart: 'geekblue',
        bitstamp: 'purple',
        bittrex: 'orange',
        poloniex: 'green',
        gemini: 'lime',
        cryptocom: 'volcano',
        blockchaincom: 'magenta',
        bitflyer: 'red',
        upbit: 'blue',
        bithumb: 'cyan',
        coinone: 'purple',
        zb: 'geekblue',
        lbank: 'orange',
        bibox: 'green',
        bigone: 'lime',
        bitrue: 'volcano',
        coinex: 'magenta',
        ftx: 'red',
        ftxus: 'blue',
        binanceus: 'gold',
        binancecoinm: 'gold',
        binanceusdm: 'gold',
        ibkr: 'green'
      }
      return colorMap[exchangeId] || 'default'
    }
  }
}
</script>

<style lang="less" scoped>
.strategy-list-card {
  .card-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .group-mode-switch {
    display: flex;
    align-items: center;
    margin-bottom: 12px;

    .group-mode-label {
      margin-right: 8px;
      font-size: 13px;
      color: rgba(0, 0, 0, 0.65);
    }
  }

  .strategy-empty-state {
    text-align: center;
    padding: 40px 16px;

    .strategy-empty-desc {
      color: rgba(0, 0, 0, 0.45);
      margin: 8px 0 16px;
    }
  }

  .strategy-grouped-list {
    .strategy-group {
      margin-bottom: 8px;

      .strategy-group-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background: rgba(0, 0, 0, 0.02);
        border-radius: 4px;
        cursor: pointer;
        transition: background 0.2s;

        &:hover {
          background: rgba(0, 0, 0, 0.04);
        }

        .group-header-left {
          display: flex;
          align-items: center;
          gap: 6px;

          .collapse-icon {
            font-size: 12px;
            color: rgba(0, 0, 0, 0.45);
          }

          .group-icon {
            color: #1890ff;
          }

          .group-name {
            font-weight: 500;
          }
        }

        .group-header-right {
          display: flex;
          align-items: center;
          gap: 8px;

          .group-status {
            font-size: 12px;

            &.running {
              color: #52c41a;
            }

            &.stopped {
              color: rgba(0, 0, 0, 0.45);
            }
          }
        }
      }

      .strategy-group-content {
        margin-top: 4px;
      }
    }
  }

  .strategy-list-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    margin-bottom: 2px;

    &:hover {
      background: rgba(24, 144, 255, 0.06);
    }

    &.active {
      background: rgba(24, 144, 255, 0.1);
      border-left: 3px solid #1890ff;
    }

    .strategy-item-content {
      flex: 1;
      min-width: 0;

      .strategy-item-header {
        .strategy-name-wrapper {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 2px;

          .strategy-name {
            font-weight: 500;
            font-size: 14px;
          }

          .strategy-name-text {
            font-size: 13px;
          }
        }
      }

      .strategy-item-info {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: 4px;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.45);

        .info-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .status-label {
          &.status-running {
            color: #52c41a;
          }

          &.status-stopped {
            color: rgba(0, 0, 0, 0.45);
          }

          &.status-error {
            color: #f5222d;
          }
        }
      }
    }

    .strategy-item-actions {
      flex-shrink: 0;
    }
  }

  .danger-item {
    color: #ff4d4f !important;
  }
}
</style>
