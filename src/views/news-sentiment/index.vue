<template>
  <div class="news-page" :class="{ 'theme-dark': isDarkTheme }">
    <div class="page-header"><h3>新闻情绪</h3>
      <a-input-search v-model="searchQuery" placeholder="搜索新闻" style="width:300px" @search="doSearch" />
    </div>
    <div class="sentiment-bar">
      <div class="sent-item"><span class="label">情绪得分</span><a-progress :percent="Math.round(sentiment.score * 100)" :stroke-color="sentiment.score > 0.5 ? '#10b981' : '#ef4444'" style="max-width:200px" /></div>
      <div class="sent-item"><span class="label">正面</span><span class="positive">{{ sentiment.positive || 0 }}</span></div>
      <div class="sent-item"><span class="label">负面</span><span class="negative">{{ sentiment.negative || 0 }}</span></div>
    </div>
    <a-list :data-source="news" :loading="loading" class="news-list">
      <a-list-item slot="renderItem" slot-scope="item">
        <a-list-item-meta :title="item.title" :description="item.summary">
          <template slot="avatar"><a-tag :color="item.sentiment > 0 ? 'green' : item.sentiment < 0 ? 'red' : 'default'">{{ item.sentiment > 0 ? '正面' : item.sentiment < 0 ? '负面' : '中性' }}</a-tag></template>
        </a-list-item-meta>
        <div class="news-meta">{{ item.source }} · {{ item.published_at }}</div>
      </a-list-item>
    </a-list>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import { getLatestNews, getNewsSentiment, searchNews } from '@/api/news'
export default {
  name: 'NewsSentiment',
  data () { return { loading: false, news: [], sentiment: { score: 0, positive: 0, negative: 0 }, searchQuery: '' } },
  computed: { ...mapState({ navTheme: s => s.app.theme }), isDarkTheme () { return this.navTheme === 'dark' || this.navTheme === 'realdark' } },
  mounted () { this.fetchData() },
  methods: {
    async fetchData () {
      this.loading = true
      try {
        const [n, s] = await Promise.all([getLatestNews({ limit: 30 }), getNewsSentiment()])
        this.news = (n.data || n) || []; this.sentiment = { ...this.sentiment, ...(s.data || s) }
      } catch (e) { console.error(e) } finally { this.loading = false }
    },
    async doSearch () {
      if (!this.searchQuery) return this.fetchData()
      this.loading = true; try { const r = await searchNews(this.searchQuery); this.news = (r.data || r) || [] } catch (e) { console.error(e) } finally { this.loading = false }
    },
  },
}
</script>
<style lang="less" scoped>
@bg:#f8fafc;@card:#fff;@border:#e2e8f0;@tp:#1e293b;@ts:#64748b;@g:#10b981;@r:#ef4444;
.news-page{padding:20px;background:@bg;min-height:100vh;
  .page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;h3{margin:0}}
  .sentiment-bar{display:flex;align-items:center;gap:24px;background:@card;border:1px solid @border;border-radius:12px;padding:12px 16px;margin-bottom:16px;
    .sent-item{display:flex;align-items:center;gap:8px;.label{font-size:12px;color:@ts}}}
  .positive{color:@g!important}.negative{color:@r!important}
  .news-meta{font-size:12px;color:@ts}
}
</style>
