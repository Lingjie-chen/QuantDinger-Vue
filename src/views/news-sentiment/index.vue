<template>
  <div class="news-page" :class="{ 'theme-dark': isDarkTheme }">
    <div class="page-header"><h3>新闻情绪</h3>
      <a-input-search v-model="searchQuery" placeholder="搜索币种 (如 BTC, ETH)" style="width:300px" @search="doSearch" />
    </div>
    <div class="sentiment-bar">
      <div class="sent-item"><span class="label">综合情绪</span><a-progress :percent="Math.round((sentiment.composite_score || 0) * 100)" :stroke-color="(sentiment.composite_score || 0) > 0.5 ? '#10b981' : '#ef4444'" style="max-width:200px" /></div>
      <div class="sent-item"><span class="label">恐惧贪婪指数</span><span :class="(sentiment.fear_greed_index || 50) > 50 ? 'positive' : 'negative'">{{ sentiment.fear_greed_index || '—' }} ({{ sentiment.fear_greed_label || sentiment.overall_status || '—' }})</span></div>
    </div>
    <a-list :data-source="news" :loading="loading" class="news-list">
      <a-list-item slot="renderItem" slot-scope="item">
        <a-list-item-meta>
          <template slot="title"><a :href="item.url" target="_blank" rel="noopener">{{ item.title }}</a></template>
          <template slot="description">{{ item.category || '' }}{{ item.currencies ? ' · ' + item.currencies : '' }}</template>
          <template slot="avatar"><a-tag :color="item.sentiment > 0 ? 'green' : item.sentiment < 0 ? 'red' : 'default'">{{ item.sentiment > 0 ? '正面' : item.sentiment < 0 ? '负面' : '中性' }}</a-tag></template>
        </a-list-item-meta>
        <div class="news-meta">{{ item.source }} · {{ item.published_at }}</div>
      </a-list-item>
    </a-list>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import { getLatestNews, getNewsSentiment } from '@/api/news'
export default {
  name: 'NewsSentiment',
  data () { return { loading: false, news: [], sentiment: { composite_score: 0, fear_greed_index: null, fear_greed_label: '', overall_status: '' }, searchQuery: '' } },
  computed: { ...mapState({ navTheme: s => s.app.theme }), isDarkTheme () { return this.navTheme === 'dark' || this.navTheme === 'realdark' } },
  mounted () { this.fetchData() },
  methods: {
    async fetchData () {
      this.loading = true
      try {
        const [n, s] = await Promise.all([getLatestNews({ limit: 30 }), getNewsSentiment()])
        const newsData = n.data || n
        this.news = newsData.news || newsData || []
        this.sentiment = { ...this.sentiment, ...(s.data || s) }
      } catch (e) { console.error(e) } finally { this.loading = false }
    },
    async doSearch () {
      if (!this.searchQuery) return this.fetchData()
      this.loading = true
      try {
        const r = await getLatestNews({ currencies: this.searchQuery, limit: 30 })
        const newsData = r.data || r
        this.news = newsData.news || newsData || []
      } catch (e) { console.error(e) } finally { this.loading = false }
    },
  },
}
</script>
<style lang="less" scoped>
@import '@/assets/design-tokens.less';

.news-page{
  padding: @qd-space-lg; min-height: 100vh;
  background: @qd-bg-gradient-light;
  background-attachment: fixed;
  &.theme-dark {
    background: @qd-bg-gradient-dark;
    background-attachment: fixed;
    .sentiment-bar { .qd-glass-dark(); .qd-panel-glow(); .qd-card-hover(); }
  }
  .page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:@qd-space-md;h3{margin:0}}
  .sentiment-bar{
    display:flex;align-items:center;gap:@qd-space-xl;
    .qd-glass-light();
    border-radius:@qd-radius-lg;padding:@qd-space-md;margin-bottom:@qd-space-md;
    .qd-card-hover-light();
    .theme-dark & { .qd-glass-dark(); .qd-panel-glow(); .qd-card-hover(); }
    .sent-item{display:flex;align-items:center;gap:@qd-space-sm;.label{font-size:@qd-font-sm;color:@qd-text-secondary-light; .theme-dark & { color: @qd-text-secondary-dark; }}}}
  .positive{.qd-positive-text()}.negative{.qd-negative-text()}
  .news-meta{font-size:@qd-font-sm;color:@qd-text-secondary-light; .theme-dark & { color: @qd-text-secondary-dark; }}
}
</style>
