/**
 * Situation API - 市场态势
 */
import request from '@/utils/request'

// GET /api/situation/overview — 态势总览
export function getSituationOverview() {
  return request({ url: '/api/situation/overview', method: 'get' })
}

// GET /api/situation/narratives — 态势叙事
export function getNarratives(params) {
  return request({ url: '/api/situation/narratives', method: 'get', params })
}

// GET /api/situation/narratives/{topic_id} — 单条叙事
export function getNarrativeDetail(topicId) {
  return request({ url: `/api/situation/narratives/${topicId}`, method: 'get' })
}

// GET /api/situation/actors — 市场参与者
export function getActors() {
  return request({ url: '/api/situation/actors', method: 'get' })
}

// GET /api/situation/correlations — 相关性分析
export function getCorrelations() {
  return request({ url: '/api/situation/correlations', method: 'get' })
}

// GET /api/situation/alerts — 态势警报
export function getSituationAlerts(params) {
  return request({ url: '/api/situation/alerts', method: 'get', params })
}

// GET /api/situation/trading-impact/{symbol} — 交易影响
export function getTradingImpact(symbol) {
  return request({ url: `/api/situation/trading-impact/${symbol}`, method: 'get' })
}

// POST /api/situation/refresh — 刷新态势数据
export function refreshSituation() {
  return request({ url: '/api/situation/refresh', method: 'post' })
}
