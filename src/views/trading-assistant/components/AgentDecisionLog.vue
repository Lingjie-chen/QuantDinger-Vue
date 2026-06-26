<template>
  <a-table
    :columns="columns"
    :data-source="decisions"
    :pagination="{ pageSize: 20 }"
    size="small"
    class="pro-table"
    row-key="id"
  >
    <template slot="confidence" slot-scope="text">
      <a-progress
        :percent="Math.round((text || 0) * 100)"
        size="small"
        :stroke-color="text > 0.7 ? '#10b981' : '#f59e0b'"
      />
    </template>
  </a-table>
</template>

<script>
export default {
  name: 'AgentDecisionLog',
  props: {
    decisions: { type: Array, default: () => [] }
  },
  data () {
    return {
      columns: [
        { title: '时间', dataIndex: 'timestamp', width: 160 },
        { title: '标的', dataIndex: 'symbol', width: 140 },
        { title: '动作', dataIndex: 'action', width: 80 },
        { title: '置信度', dataIndex: 'confidence', scopedSlots: { customRender: 'confidence' } },
        { title: '原因', dataIndex: 'reason' }
      ]
    }
  }
}
</script>
