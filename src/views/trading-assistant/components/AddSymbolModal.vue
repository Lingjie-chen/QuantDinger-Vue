<template>
  <a-modal
    :title="$t('trading-assistant.form.addSymbolTitle')"
    :visible="visible"
    @ok="handleConfirmAddSymbol"
    @cancel="handleCloseAddSymbolModal"
    :confirmLoading="addingSymbol"
    width="600px"
    :okText="$t('trading-assistant.form.confirmAdd')"
    :cancelText="$t('trading-assistant.form.cancel')"
    :maskClosable="false"
    :keyboard="false">
    <div class="add-symbol-modal-content">
      <!-- 市场类型Tab -->
      <a-tabs v-model="addSymbolMarket" @change="handleAddSymbolMarketChange" class="market-tabs">
        <a-tab-pane
          v-for="marketType in addSymbolMarketTypes"
          :key="marketType.value"
          :tab="$t(marketType.i18nKey || `dashboard.analysis.market.${marketType.value}`)">
        </a-tab-pane>
      </a-tabs>

      <!-- 搜索输入框 -->
      <div class="symbol-search-section">
        <a-input-search
          v-model="addSymbolKeyword"
          :placeholder="$t('dashboard.analysis.modal.addStock.searchOrInputPlaceholder')"
          @search="handleSearchSymbol"
          @change="handleSymbolSearchInputChange"
          :loading="searchingSymbol"
          size="large"
          allow-clear>
          <a-button slot="enterButton" type="primary" icon="search">
            {{ $t('dashboard.analysis.modal.addStock.search') }}
          </a-button>
        </a-input-search>
      </div>

      <!-- 搜索结果 -->
      <div v-if="symbolSearchResults.length > 0" class="search-results-section">
        <div class="section-title">
          <a-icon type="search" style="margin-right: 4px;" />
          {{ $t('dashboard.analysis.modal.addStock.searchResults') }}
        </div>
        <a-list
          :data-source="symbolSearchResults"
          :loading="searchingSymbol"
          size="small"
          class="symbol-list">
          <a-list-item slot="renderItem" slot-scope="item" class="symbol-list-item" @click="handleSelectAddSymbol(item)">
            <a-list-item-meta>
              <template slot="title">
                <div class="symbol-item-content">
                  <span class="symbol-code">{{ item.symbol }}</span>
                  <span class="symbol-name">{{ item.name }}</span>
                  <a-tag v-if="item.exchange" size="small" color="blue" style="margin-left: 8px;">
                    {{ item.exchange }}
                  </a-tag>
                </div>
              </template>
            </a-list-item-meta>
          </a-list-item>
        </a-list>
      </div>

      <!-- 热门标的 -->
      <div class="hot-symbols-section">
        <div class="section-title">
          <a-icon type="fire" style="color: #ff4d4f; margin-right: 4px;" />
          {{ $t('dashboard.analysis.modal.addStock.hotSymbols') }}
        </div>
        <a-spin :spinning="loadingHotSymbols">
          <a-list
            v-if="hotSymbols.length > 0"
            :data-source="hotSymbols"
            size="small"
            class="symbol-list">
            <a-list-item slot="renderItem" slot-scope="item" class="symbol-list-item" @click="handleSelectAddSymbol(item)">
              <a-list-item-meta>
                <template slot="title">
                  <div class="symbol-item-content">
                    <span class="symbol-code">{{ item.symbol }}</span>
                    <span class="symbol-name">{{ item.name }}</span>
                    <a-tag v-if="item.exchange" size="small" color="orange" style="margin-left: 8px;">
                      {{ item.exchange }}
                    </a-tag>
                  </div>
                </template>
              </a-list-item-meta>
            </a-list-item>
          </a-list>
          <a-empty v-else :description="$t('dashboard.analysis.modal.addStock.noHotSymbols')" :image="false" />
        </a-spin>
      </div>

      <!-- 选中的标的显示 -->
      <div v-if="selectedAddSymbol" class="selected-symbol-section">
        <div class="section-title">
          <a-icon type="check-circle" style="color: #52c41a; margin-right: 4px;" />
          {{ $t('dashboard.analysis.modal.addStock.selectedSymbol') }}
        </div>
        <div class="selected-symbol-info">
          <a-tag :color="getMarketColor(addSymbolMarket)" style="margin-right: 8px;">{{ addSymbolMarket }}</a-tag>
          <span class="symbol-code">{{ selectedAddSymbol.symbol }}</span>
          <span v-if="selectedAddSymbol.name" class="symbol-name">{{ selectedAddSymbol.name }}</span>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script>
import { searchSymbols, getHotSymbols, addWatchlist, getWatchlist } from '@/api/market'

export default {
  name: 'AddSymbolModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      addSymbolMarket: 'Crypto',
      addSymbolMarketTypes: [
        { value: 'Crypto', i18nKey: 'dashboard.analysis.market.Crypto' },
        { value: 'USStock', i18nKey: 'dashboard.analysis.market.USStock' },
        { value: 'Forex', i18nKey: 'dashboard.analysis.market.Forex' },
        { value: 'Futures', i18nKey: 'dashboard.analysis.market.Futures' }
      ],
      addSymbolKeyword: '',
      searchingSymbol: false,
      symbolSearchResults: [],
      selectedAddSymbol: null,
      hasSearchedSymbol: false,
      addingSymbol: false,
      hotSymbols: [],
      loadingHotSymbols: false,
      searchTimer: null
    }
  },
  watch: {
    visible (val) {
      if (val) {
        this.loadHotSymbols(this.addSymbolMarket)
      }
    }
  },
  methods: {
    handleCloseAddSymbolModal () {
      this.addSymbolKeyword = ''
      this.symbolSearchResults = []
      this.selectedAddSymbol = null
      this.hasSearchedSymbol = false
      this.$emit('update:visible', false)
      this.$emit('cancel')
    },
    handleAddSymbolMarketChange (market) {
      this.addSymbolMarket = market
      this.addSymbolKeyword = ''
      this.symbolSearchResults = []
      this.selectedAddSymbol = null
      this.hasSearchedSymbol = false
      this.loadHotSymbols(market)
    },
    handleSymbolSearchInputChange (e) {
      const keyword = e.target.value
      this.addSymbolKeyword = keyword

      if (this.searchTimer) {
        clearTimeout(this.searchTimer)
      }

      if (!keyword || keyword.trim() === '') {
        this.symbolSearchResults = []
        this.hasSearchedSymbol = false
        this.selectedAddSymbol = null
        return
      }

      this.searchTimer = setTimeout(() => {
        this.searchSymbolsInModal(keyword)
      }, 500)
    },
    async handleSearchSymbol (keyword) {
      if (!keyword || !keyword.trim()) {
        return
      }

      if (!this.addSymbolMarket) {
        this.$message.warning(this.$t('dashboard.analysis.modal.addStock.pleaseSelectMarket'))
        return
      }

      if (this.symbolSearchResults.length > 0) {
        return
      }

      if (this.hasSearchedSymbol && this.symbolSearchResults.length === 0) {
        this.handleDirectAdd()
      } else {
        this.searchSymbolsInModal(keyword)
      }
    },
    async searchSymbolsInModal (keyword) {
      if (!keyword || keyword.trim() === '') {
        this.symbolSearchResults = []
        this.hasSearchedSymbol = false
        return
      }

      if (!this.addSymbolMarket) {
        return
      }

      this.searchingSymbol = true
      this.hasSearchedSymbol = true

      try {
        const res = await searchSymbols({
          market: this.addSymbolMarket,
          keyword: keyword.trim()
        })
        if (res && res.code === 1 && Array.isArray(res.data)) {
          this.symbolSearchResults = res.data
        } else {
          this.symbolSearchResults = []
        }
      } catch (e) {
        this.symbolSearchResults = []
      } finally {
        this.searchingSymbol = false
      }
    },
    handleDirectAdd () {
      if (!this.addSymbolKeyword || !this.addSymbolKeyword.trim()) {
        this.$message.warning(this.$t('dashboard.analysis.modal.addStock.pleaseEnterSymbol'))
        return
      }

      if (!this.addSymbolMarket) {
        this.$message.warning(this.$t('dashboard.analysis.modal.addStock.pleaseSelectMarket'))
        return
      }

      this.selectedAddSymbol = {
        market: this.addSymbolMarket,
        symbol: this.addSymbolKeyword.trim().toUpperCase(),
        name: ''
      }
    },
    handleSelectAddSymbol (item) {
      this.selectedAddSymbol = {
        market: this.addSymbolMarket,
        symbol: item.symbol,
        name: item.name || ''
      }
    },
    async loadHotSymbols (market) {
      if (!market) {
        market = this.addSymbolMarket || 'Crypto'
      }

      if (!market) {
        return
      }

      this.loadingHotSymbols = true
      try {
        const res = await getHotSymbols({
          market: market,
          limit: 10
        })
        if (res && res.code === 1 && res.data) {
          this.hotSymbols = res.data
        } else {
          this.hotSymbols = []
        }
      } catch (error) {
        this.hotSymbols = []
      } finally {
        this.loadingHotSymbols = false
      }
    },
    async handleConfirmAddSymbol () {
      let market = ''
      let symbol = ''

      if (this.selectedAddSymbol) {
        market = this.selectedAddSymbol.market
        symbol = this.selectedAddSymbol.symbol.toUpperCase()
      } else if (this.addSymbolKeyword && this.addSymbolKeyword.trim()) {
        if (!this.addSymbolMarket) {
          this.$message.warning(this.$t('dashboard.analysis.modal.addStock.pleaseSelectMarket'))
          return
        }
        market = this.addSymbolMarket
        symbol = this.addSymbolKeyword.trim().toUpperCase()
      } else {
        this.$message.warning(this.$t('dashboard.analysis.modal.addStock.pleaseSelectOrEnterSymbol'))
        return
      }

      this.addingSymbol = true
      try {
        const res = await addWatchlist({
          userid: 1,
          market: market,
          symbol: symbol
        })
        if (res && res.code === 1) {
          this.$message.success(this.$t('dashboard.analysis.message.addStockSuccess'))
          // Reload watchlist in parent
          await this.reloadWatchlist()
          // Notify parent of the new symbol
          this.$emit('confirm', { market, symbol })
          this.handleCloseAddSymbolModal()
        } else {
          this.$message.error(res?.msg || this.$t('dashboard.analysis.message.addStockFailed'))
        }
      } catch (e) {
        const errorMsg = e?.response?.data?.msg || e?.message || this.$t('dashboard.analysis.message.addStockFailed')
        this.$message.error(errorMsg)
      } finally {
        this.addingSymbol = false
      }
    },
    async reloadWatchlist () {
      try {
        const res = await getWatchlist({ userid: 1 })
        if (res && res.code === 1) {
          // Parent should reload its own watchlist
        }
      } catch (e) {
        // ignore
      }
    },
    getMarketColor (market) {
      const colors = {
        USStock: 'green',
        Crypto: 'purple',
        Forex: 'gold',
        Futures: 'cyan'
      }
      return colors[market] || 'default'
    }
  }
}
</script>

<style lang="less" scoped>
.add-symbol-modal-content {
  .market-tabs {
    margin-bottom: 16px;
  }

  .symbol-search-section {
    margin-bottom: 16px;
  }

  .search-results-section,
  .hot-symbols-section {
    margin-bottom: 16px;

    .section-title {
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 8px;
      color: rgba(0, 0, 0, 0.85);
    }
  }

  .symbol-list {
    max-height: 240px;
    overflow-y: auto;

    .symbol-list-item {
      cursor: pointer;
      padding: 8px 12px;
      transition: background-color 0.2s;

      &:hover {
        background-color: #f5f5f5;
      }

      .symbol-item-content {
        display: flex;
        align-items: center;
        flex-wrap: wrap;

        .symbol-code {
          font-weight: 600;
          margin-right: 8px;
        }

        .symbol-name {
          color: rgba(0, 0, 0, 0.45);
          font-size: 13px;
        }
      }
    }
  }

  .selected-symbol-section {
    margin-top: 16px;
    padding: 12px;
    background: #f6ffed;
    border-radius: 4px;
    border: 1px solid #b7eb8f;

    .section-title {
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 8px;
      color: rgba(0, 0, 0, 0.85);
    }

    .selected-symbol-info {
      display: flex;
      align-items: center;

      .symbol-code {
        font-weight: 600;
        margin-right: 8px;
      }

      .symbol-name {
        color: rgba(0, 0, 0, 0.45);
        font-size: 13px;
      }
    }
  }
}
</style>
