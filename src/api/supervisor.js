/**
 * Supervisor API - Kill Switch & Agent Status
 */
import request from '@/utils/request'

/**
 * 获取风控 Supervisor 状态（kill switch + agent 运行状态）
 */
export function getSupervisorStatus () {
  return request({
    url: '/api/supervisor/status',
    method: 'get'
  })
}

/**
 * 激活紧急停止开关
 * @param {string} reason - 停止原因
 * @param {string} activatedBy - 触发来源 (默认 "user")
 */
export function activateKillSwitch (reason = 'Manual activation via UI', activatedBy = 'user') {
  return request({
    url: '/api/supervisor/kill-switch/activate',
    method: 'post',
    data: { reason, activated_by: activatedBy }
  })
}

/**
 * 解除紧急停止开关
 */
export function deactivateKillSwitch () {
  return request({
    url: '/api/supervisor/kill-switch/deactivate',
    method: 'post'
  })
}
