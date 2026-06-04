/**
 * Composite API - 组合策略引擎
 */
import request from '@/utils/request'

/**
 * 获取组合策略引擎状态
 */
export function getCompositeStatus () {
  return request({
    url: '/api/composite/status',
    method: 'get'
  })
}

/**
 * 运行组合策略评估
 * @param {Object} data - 评估参数 {symbols?: string[], market_state?: string, capital?: number}
 */
export function evaluateComposite (data = {}) {
  return request({
    url: '/api/composite/evaluate',
    method: 'post',
    data
  })
}

/**
 * 获取当前各策略权重
 */
export function getCompositeWeights () {
  return request({
    url: '/api/composite/weights',
    method: 'get'
  })
}

/**
 * 根据绩效更新策略权重
 * @param {Object} metrics - 各策略绩效指标
 */
export function updateCompositeWeights (metrics) {
  return request({
    url: '/api/composite/weights/update',
    method: 'post',
    data: metrics
  })
}

/**
 * 更新组合使用的市场状态
 * @param {string} state - 市场状态标识
 */
export function setMarketState (state) {
  return request({
    url: '/api/composite/market-state',
    method: 'post',
    data: { market_state: state }
  })
}

/**
 * 更新总资金，用于仓位分配
 * @param {number} capital - 总资金
 */
export function setTotalCapital (capital) {
  return request({
    url: '/api/composite/capital',
    method: 'post',
    data: { capital }
  })
}

/**
 * 获取上一次评估信号
 */
export function getLastSignal () {
  return request({
    url: '/api/composite/last-signal',
    method: 'get'
  })
}
