<template>
  <div class="hot-params-page" :class="{ 'theme-dark': isDarkTheme }">
    <div class="page-header"><h3>热参数管理</h3><a-button @click="fetchParams"><a-icon type="reload" /></a-button></div>
    <a-table :columns="columns" :data-source="params" :loading="loading" size="small" row-key="key" class="pro-table">
      <template slot="value" slot-scope="text, record">
        <a-input v-if="editing === record.key" v-model="editValue" size="small" style="width:200px" @pressEnter="saveParam(record.key)" />
        <span v-else>{{ text }}</span>
      </template>
      <template slot="actions" slot-scope="_, record">
        <a-button v-if="editing !== record.key" size="small" type="link" @click="startEdit(record)">编辑</a-button>
        <template v-else>
          <a-button size="small" type="primary" @click="saveParam(record.key)">保存</a-button>
          <a-button size="small" @click="editing = null">取消</a-button>
        </template>
      </template>
    </a-table>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import { getHotParams, updateHotParam } from '@/api/hot-params'
export default {
  name: 'HotParams',
  data () {
    return { loading: false, params: [], editing: null, editValue: '',
      columns: [
        { title: '参数名', dataIndex: 'key', width: 200 },
        { title: '当前值', dataIndex: 'value', scopedSlots: { customRender: 'value' } },
        { title: '说明', dataIndex: 'description' },
        { title: '更新时间', dataIndex: 'updated_at', width: 160 },
        { title: '操作', width: 160, scopedSlots: { customRender: 'actions' } },
      ],
    }
  },
  computed: { ...mapState({ navTheme: s => s.app.theme }), isDarkTheme () { return this.navTheme === 'dark' || this.navTheme === 'realdark' } },
  mounted () { this.fetchParams() },
  methods: {
    async fetchParams () {
      this.loading = true
      try { const r = await getHotParams(); this.params = Object.entries(r.data || r || {}).map(([k, v]) => ({ key: k, value: typeof v === 'object' ? JSON.stringify(v) : v, description: '', updated_at: '' })) }
      catch (e) { console.error(e) } finally { this.loading = false }
    },
    startEdit (record) { this.editing = record.key; this.editValue = String(record.value) },
    async saveParam (key) {
      try { await updateHotParam(key, this.editValue); this.$message.success('已更新'); this.editing = null; this.fetchParams() }
      catch (e) { this.$message.error('更新失败') }
    },
  },
}
</script>
<style lang="less" scoped>
@bg:#f8fafc;@card:#fff;@border:#e2e8f0;@tp:#1e293b;
.hot-params-page{padding:20px;background:@bg;min-height:100vh;
  .page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;h3{margin:0}}
}
</style>
