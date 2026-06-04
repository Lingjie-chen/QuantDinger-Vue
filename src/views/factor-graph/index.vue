<template>
  <div class="factor-graph-page">
    <div class="top-bar">
      <span class="title">Factor Graph</span>
      <span class="stats-inline" v-if="stats.total_edges">
        {{ stats.total_edges }} edges · {{ stats.unique_factors }} factors
      </span>
      <span class="error-msg" v-if="error">{{ error }}</span>
    </div>

    <div class="main-layout">
      <canvas ref="canvas" class="graph-canvas" @mousedown="onMouseDown" @mousemove="onMouseMove"
        @mouseup="onMouseUp" @wheel.prevent="onWheel" />

      <div class="side-panel">
        <div class="panel-section">
          <div class="section-title">Top 10 Factors</div>
          <div v-if="topFactors.length === 0" class="empty">Loading...</div>
          <div v-for="(f, i) in topFactors" :key="f.id || i" class="factor-item">
            <span class="rank">{{ i + 1 }}</span>
            <span class="fname">{{ f.name || f.id }}</span>
            <span class="fval" v-if="f.ic !== undefined">IC {{ f.ic.toFixed(3) }}</span>
            <span class="fval" v-else-if="f.sharpe !== undefined">SR {{ f.sharpe.toFixed(2) }}</span>
          </div>
        </div>

        <div class="panel-section" v-if="stats.by_type">
          <div class="section-title">By Type</div>
          <div v-for="(count, type) in stats.by_type" :key="type" class="type-item">
            <span class="type-dot" :style="{ background: TYPE_COLORS[type] || '#888' }"></span>
            <span class="type-name">{{ type }}</span>
            <span class="type-count">{{ count }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const TYPE_COLORS = {
  correlates_with: '#52c41a',
  derives_from: '#1890ff',
  complements: '#722ed1',
  contradicts: '#f5222d',
  stable_in: '#13c2c2',
  degrades_in: '#fa8c16',
  evolved_to: '#eb2f96',
  requires: '#faad14',
  similar_to: '#a0d911',
  inspired_by: '#2f54eb'
}

const NODE_R = 18
const REPULSION = 3000
const ATTRACTION = 0.04
const DAMPING = 0.85
const ITERATIONS = 200

function initLayout (nodes, edges) {
  const n = nodes.length
  nodes.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / n
    node.x = 400 + 250 * Math.cos(angle)
    node.y = 300 + 250 * Math.sin(angle)
    node.vx = 0
    node.vy = 0
  })

  for (let iter = 0; iter < ITERATIONS; iter++) {
    // repulsion
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = nodes[i].x - nodes[j].x
        const dy = nodes[i].y - nodes[j].y
        const dist2 = dx * dx + dy * dy + 1
        const force = REPULSION / dist2
        nodes[i].vx += force * dx / Math.sqrt(dist2)
        nodes[i].vy += force * dy / Math.sqrt(dist2)
        nodes[j].vx -= force * dx / Math.sqrt(dist2)
        nodes[j].vy -= force * dy / Math.sqrt(dist2)
      }
    }
    // attraction
    const idxMap = {}
    nodes.forEach((nd, i) => { idxMap[nd.id] = i })
    edges.forEach(e => {
      const si = idxMap[e.source_id], ti = idxMap[e.target_id]
      if (si === undefined || ti === undefined) return
      const dx = nodes[ti].x - nodes[si].x
      const dy = nodes[ti].y - nodes[si].y
      nodes[si].vx += ATTRACTION * dx
      nodes[si].vy += ATTRACTION * dy
      nodes[ti].vx -= ATTRACTION * dx
      nodes[ti].vy -= ATTRACTION * dy
    })
    // integrate
    nodes.forEach(nd => {
      nd.vx *= DAMPING
      nd.vy *= DAMPING
      nd.x += nd.vx
      nd.y += nd.vy
    })
  }
}

export default {
  name: 'FactorGraph',
  data () {
    return {
      nodes: [],
      edges: [],
      stats: {},
      topFactors: [],
      error: null,
      TYPE_COLORS,
      // pan/zoom
      offsetX: 0,
      offsetY: 0,
      scale: 1,
      // drag
      dragging: null,
      lastMouse: null,
      isPanning: false
    }
  },
  mounted () {
    this.fetchData()
    window.addEventListener('resize', this.resize)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.resize)
    if (this._raf) cancelAnimationFrame(this._raf)
  },
  methods: {
    async fetchData () {
      try {
        const [gRes, fRes] = await Promise.all([
          fetch('/api/evolution/factor-graph/data'),
          fetch('/api/evolution/factor-graph/top-factors')
        ])
        const gData = await gRes.json()
        const fData = await fRes.json()

        if (gData.success) {
          this.nodes = gData.data.nodes.map(n => ({ ...n, x: 0, y: 0, vx: 0, vy: 0 }))
          this.edges = gData.data.edges || []
          this.stats = gData.data.stats || {}
          if (gData.data.error) this.error = gData.data.error
          initLayout(this.nodes, this.edges)
        }
        if (fData.success) {
          this.topFactors = fData.data || []
          if (fData.error && !this.error) this.error = fData.error
        }
      } catch (e) {
        this.error = e.message
      }
      this.$nextTick(() => {
        this.resize()
        this.draw()
      })
    },
    resize () {
      const canvas = this.$refs.canvas
      if (!canvas) return
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      this.draw()
    },
    draw () {
      const canvas = this.$refs.canvas
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      const W = canvas.width, H = canvas.height
      ctx.clearRect(0, 0, W, H)
      ctx.save()
      ctx.translate(this.offsetX + W / 2, this.offsetY + H / 2)
      ctx.scale(this.scale, this.scale)
      ctx.translate(-W / 2, -H / 2)

      // edges
      const idxMap = {}
      this.nodes.forEach((nd, i) => { idxMap[nd.id] = i })

      this.edges.forEach(e => {
        const si = idxMap[e.source_id], ti = idxMap[e.target_id]
        if (si === undefined || ti === undefined) return
        const s = this.nodes[si], t = this.nodes[ti]
        const color = TYPE_COLORS[e.relation_type] || '#555'
        const dx = t.x - s.x, dy = t.y - s.y
        const len = Math.sqrt(dx * dx + dy * dy) || 1
        const ex = t.x - (dx / len) * NODE_R
        const ey = t.y - (dy / len) * NODE_R

        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(ex, ey)
        ctx.strokeStyle = color
        ctx.globalAlpha = 0.5
        ctx.lineWidth = 1
        ctx.stroke()

        // arrowhead
        const angle = Math.atan2(dy, dx)
        ctx.beginPath()
        ctx.moveTo(ex, ey)
        ctx.lineTo(ex - 8 * Math.cos(angle - 0.4), ey - 8 * Math.sin(angle - 0.4))
        ctx.lineTo(ex - 8 * Math.cos(angle + 0.4), ey - 8 * Math.sin(angle + 0.4))
        ctx.closePath()
        ctx.fillStyle = color
        ctx.globalAlpha = 0.7
        ctx.fill()
      })

      ctx.globalAlpha = 1

      // nodes
      this.nodes.forEach(nd => {
        ctx.beginPath()
        ctx.arc(nd.x, nd.y, NODE_R, 0, Math.PI * 2)
        ctx.fillStyle = '#1a2332'
        ctx.fill()
        ctx.strokeStyle = '#1890ff'
        ctx.lineWidth = 1.5
        ctx.stroke()

        ctx.fillStyle = '#e8f4fd'
        ctx.font = '10px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        const label = nd.label.length > 10 ? nd.label.slice(0, 9) + '…' : nd.label
        ctx.fillText(label, nd.x, nd.y)
      })

      ctx.restore()
    },
    toWorld (cx, cy) {
      const canvas = this.$refs.canvas
      const W = canvas.width, H = canvas.height
      return {
        x: (cx - this.offsetX - W / 2) / this.scale + W / 2,
        y: (cy - this.offsetY - H / 2) / this.scale + H / 2
      }
    },
    onMouseDown (e) {
      const rect = this.$refs.canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left, my = e.clientY - rect.top
      const w = this.toWorld(mx, my)
      const hit = this.nodes.find(nd => {
        const dx = nd.x - w.x, dy = nd.y - w.y
        return dx * dx + dy * dy < NODE_R * NODE_R
      })
      if (hit) {
        this.dragging = hit
      } else {
        this.isPanning = true
        this.lastMouse = { x: mx, y: my }
      }
    },
    onMouseMove (e) {
      const rect = this.$refs.canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left, my = e.clientY - rect.top
      if (this.dragging) {
        const w = this.toWorld(mx, my)
        this.dragging.x = w.x
        this.dragging.y = w.y
        this.draw()
      } else if (this.isPanning && this.lastMouse) {
        this.offsetX += mx - this.lastMouse.x
        this.offsetY += my - this.lastMouse.y
        this.lastMouse = { x: mx, y: my }
        this.draw()
      }
    },
    onMouseUp () {
      this.dragging = null
      this.isPanning = false
      this.lastMouse = null
    },
    onWheel (e) {
      const factor = e.deltaY < 0 ? 1.1 : 0.9
      this.scale = Math.min(4, Math.max(0.2, this.scale * factor))
      this.draw()
    }
  }
}
</script>

<style scoped>
.factor-graph-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #0d1117;
  color: #c9d1d9;
  font-family: sans-serif;
}
.top-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 16px;
  border-bottom: 1px solid #21262d;
}
.title { font-size: 16px; font-weight: 600; color: #e6edf3; }
.stats-inline { font-size: 12px; color: #8b949e; }
.error-msg { font-size: 12px; color: #f85149; }
.main-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}
.graph-canvas {
  flex: 1;
  cursor: grab;
  display: block;
}
.graph-canvas:active { cursor: grabbing; }
.side-panel {
  width: 220px;
  border-left: 1px solid #21262d;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.panel-section {}
.section-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #8b949e;
  margin-bottom: 8px;
}
.empty { font-size: 12px; color: #484f58; }
.factor-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
  border-bottom: 1px solid #161b22;
  font-size: 12px;
}
.rank { color: #484f58; width: 16px; text-align: right; }
.fname { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fval { color: #58a6ff; font-size: 11px; }
.type-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 0;
  font-size: 12px;
}
.type-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.type-name { flex: 1; color: #8b949e; font-size: 11px; }
.type-count { color: #c9d1d9; }
</style>
