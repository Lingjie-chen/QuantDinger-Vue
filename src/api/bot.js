import request from '@/utils/request'

export function listBots(params) {
  return request({ url: '/api/bots', method: 'get', params })
}

export function createBot(data) {
  return request({ url: '/api/bots/create', method: 'post', data })
}

export function getBot(botId) {
  return request({ url: `/api/bots/${botId}`, method: 'get' })
}

export function startBot(botId) {
  return request({ url: `/api/bots/${botId}/start`, method: 'post' })
}

export function stopBot(botId) {
  return request({ url: `/api/bots/${botId}/stop`, method: 'post' })
}

export function deleteBot(botId) {
  return request({ url: `/api/bots/${botId}`, method: 'delete' })
}
