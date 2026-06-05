<template>
  <div class="journal-page" :class="{ 'theme-dark': isDarkTheme }">
    <div class="page-header"><h3>交易日志</h3><a-button type="primary" @click="showCreate = true"><a-icon type="plus" /> 新增</a-button></div>
    <a-table :columns="columns" :data-source="entries" :loading="loading" size="small" row-key="id" class="pro-table">
      <template slot="mood" slot-scope="text">
        <span>{{ {calm:'冷静',confident:'自信',anxious:'焦虑',fomo:'FOMO',fear:'恐惧'}[text] || text }}</span>
      </template>
      <template slot="actions" slot-scope="_, r">
        <a-button size="small" type="link" @click="editEntry(r)">编辑</a-button>
        <a-popconfirm title="确认删除？" @confirm="remove(r.id)"><a-button size="small" type="danger">删除</a-button></a-popconfirm>
      </template>
    </a-table>
    <a-modal v-model="showCreate" title="新增日志" @ok="saveEntry">
      <a-form-model :model="form" layout="vertical">
        <a-form-model-item label="内容"><a-textarea v-model="form.content" :rows="4" /></a-form-model-item>
        <a-form-model-item label="情绪"><a-select v-model="form.mood"><a-select-option value="calm">冷静</a-select-option><a-select-option value="confident">自信</a-select-option><a-select-option value="anxious">焦虑</a-select-option><a-select-option value="fomo">FOMO</a-select-option><a-select-option value="fear">恐惧</a-select-option></a-select></a-form-model-item>
        <a-form-model-item label="标的"><a-input v-model="form.symbol" placeholder="可选" /></a-form-model-item>
      </a-form-model>
    </a-modal>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import { getJournalEntries, createJournalEntry, updateJournalEntry, deleteJournalEntry } from '@/api/journal'
export default {
  name: 'Journal',
  data () {
    return { loading: false, entries: [], showCreate: false, editingId: null,
      form: { content: '', mood: 'calm', symbol: '' },
      columns: [
        { title: '时间', dataIndex: 'created_at', width: 160 },
        { title: '标的', dataIndex: 'symbol', width: 130 },
        { title: '内容', dataIndex: 'content' },
        { title: '情绪', dataIndex: 'mood', width: 80, scopedSlots: { customRender: 'mood' } },
        { title: '操作', width: 140, scopedSlots: { customRender: 'actions' } },
      ],
    }
  },
  computed: { ...mapState({ navTheme: s => s.app.theme }), isDarkTheme () { return this.navTheme === 'dark' || this.navTheme === 'realdark' } },
  mounted () { this.fetchEntries() },
  methods: {
    async fetchEntries () { this.loading = true; try { const r = await getJournalEntries(); this.entries = ((r.data || r) || {}).list || (r.data || r) || [] } catch (e) { console.error(e) } finally { this.loading = false } },
    editEntry (r) { this.editingId = r.id; this.form = { content: r.content, mood: r.mood, symbol: r.symbol }; this.showCreate = true },
    async saveEntry () {
      try { this.editingId ? await updateJournalEntry(this.editingId, this.form) : await createJournalEntry(this.form); this.$message.success('已保存'); this.showCreate = false; this.editingId = null; this.form = { content: '', mood: 'calm', symbol: '' }; this.fetchEntries() }
      catch (e) { this.$message.error('保存失败') }
    },
    async remove (id) { try { await deleteJournalEntry(id); this.$message.success('已删除'); this.fetchEntries() } catch (e) { this.$message.error('删除失败') } },
  },
}
</script>
<style lang="less" scoped>
@bg:#f8fafc;@card:#fff;@border:#e2e8f0;
.journal-page{padding:20px;background:@bg;min-height:100vh;
  .page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;h3{margin:0}}
}
</style>
