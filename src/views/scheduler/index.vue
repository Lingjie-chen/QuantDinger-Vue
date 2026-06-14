<template>
  <div class="scheduler-page" :class="{ 'theme-dark': isDarkTheme }">
    <div class="page-header"><h3>调度管理</h3><a-button type="primary" @click="showCreate = true"><a-icon type="plus" /> 新建任务</a-button></div>
    <a-table :columns="columns" :data-source="jobs" :loading="loading" size="small" row-key="id" class="pro-table">
      <template slot="status" slot-scope="text"><a-tag :color="text === 'running' ? 'green' : text === 'paused' ? 'orange' : 'default'">{{ text }}</a-tag></template>
      <template slot="actions" slot-scope="_, r">
        <a-button v-if="r.status === 'running'" size="small" @click="pause(r.id)">暂停</a-button>
        <a-button v-if="r.status === 'paused'" size="small" type="primary" @click="resume(r.id)">恢复</a-button>
        <a-popconfirm title="确认删除？" @confirm="remove(r.id)"><a-button size="small" type="danger">删除</a-button></a-popconfirm>
      </template>
    </a-table>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import { getScheduledJobs, pauseJob, resumeJob, deleteJob } from '@/api/scheduler'
export default {
  name: 'Scheduler',
  data () {
    return { loading: false, jobs: [], showCreate: false,
      columns: [
        { title: '任务名', dataIndex: 'name' }, { title: '类型', dataIndex: 'type', width: 100 },
        { title: 'Cron', dataIndex: 'cron', width: 120 }, { title: '状态', dataIndex: 'status', width: 80, scopedSlots: { customRender: 'status' } },
        { title: '上次运行', dataIndex: 'last_run', width: 160 }, { title: '操作', width: 180, scopedSlots: { customRender: 'actions' } },
      ],
    }
  },
  computed: { ...mapState({ navTheme: s => s.app.theme }), isDarkTheme () { return this.navTheme === 'dark' || this.navTheme === 'realdark' } },
  mounted () { this.fetchJobs() },
  methods: {
    async fetchJobs () { this.loading = true; try { const r = await getScheduledJobs(); this.jobs = (r.data || r) || [] } catch (e) { console.error(e) } finally { this.loading = false } },
    async pause (id) { try { await pauseJob(id); this.$message.success('已暂停'); this.fetchJobs() } catch (e) { this.$message.error('操作失败') } },
    async resume (id) { try { await resumeJob(id); this.$message.success('已恢复'); this.fetchJobs() } catch (e) { this.$message.error('操作失败') } },
    async remove (id) { try { await deleteJob(id); this.$message.success('已删除'); this.fetchJobs() } catch (e) { this.$message.error('操作失败') } },
  },
}
</script>
<style lang="less" scoped>
@bg:#f8fafc;@card:#fff;@border:#e2e8f0;
.scheduler-page{padding:24px;background:@bg;min-height:100vh;
  .page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;h3{margin:0}}
}
</style>
