import { ref, onMounted, onUnmounted } from 'vue'

/**
 * 订单轮询 composable
 * @param {Function} fetchFn - 返回 Promise 的拉取函数
 * @param {number} interval - 轮询间隔（ms）
 */
export function useOrderPolling(fetchFn, interval = 30000) {
  const orders = ref([])
  const loading = ref(false)
  const pagination = ref({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const soundEnabled = ref(true)
  const lastOrderCount = ref(0)

  let timer = null

  // Web Audio 蜂鸣
  let audioCtx = null

  function playBeep() {
    if (!soundEnabled.value) return
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      }
      const oscillator = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      oscillator.connect(gain)
      gain.connect(audioCtx.destination)
      oscillator.type = 'sine'
      oscillator.frequency.value = 880
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3)
      oscillator.start(audioCtx.currentTime)
      oscillator.stop(audioCtx.currentTime + 0.3)
    } catch (e) {
      // 静默失败
    }
  }

  async function fetchOrders() {
    if (loading.value) return
    loading.value = true
    try {
      const res = await fetchFn({
        page: pagination.value.current,
        pageSize: pagination.value.pageSize
      })
      const result = res.data || res
      const newOrders = result.data || result.records || result.list || result || []
      orders.value = Array.isArray(newOrders) ? newOrders : []

      if (result.total !== undefined) {
        pagination.value.total = result.total
      }

      // 有新订单产生时播放提示音
      if (lastOrderCount.value > 0 && orders.value.length > lastOrderCount.value) {
        playBeep()
      }
      lastOrderCount.value = orders.value.length
    } catch (e) {
      console.error('Fetch pending orders failed:', e)
    } finally {
      loading.value = false
    }
  }

  function toggleSound() {
    soundEnabled.value = !soundEnabled.value
  }

  function startPolling() {
    if (timer) return
    fetchOrders()
    timer = setInterval(fetchOrders, interval)
  }

  function stopPolling() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  function handleTableChange(paginationInfo) {
    pagination.value.current = paginationInfo.current || 1
    pagination.value.pageSize = paginationInfo.pageSize || 10
    fetchOrders()
  }

  onMounted(() => {
    startPolling()
  })

  onUnmounted(() => {
    stopPolling()
  })

  return {
    orders,
    loading,
    pagination,
    soundEnabled,
    fetchOrders,
    toggleSound,
    startPolling,
    stopPolling,
    handleTableChange
  }
}
