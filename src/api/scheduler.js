/**
 * Scheduler API - 调度管理
 */
import request from '@/utils/request'

export function getSchedulerStatus() {
  return request({ url: '/api/scheduler/status', method: 'get' })
}

export function getScheduledJobs() {
  return request({ url: '/api/scheduler/jobs', method: 'get' })
}

export function createJob(data) {
  return request({ url: '/api/scheduler/jobs', method: 'post', data })
}

export function deleteJob(jobId) {
  return request({ url: `/api/scheduler/jobs/${jobId}`, method: 'delete' })
}

export function pauseJob(jobId) {
  return request({ url: `/api/scheduler/jobs/${jobId}/pause`, method: 'post' })
}

export function resumeJob(jobId) {
  return request({ url: `/api/scheduler/jobs/${jobId}/resume`, method: 'post' })
}

export function getJobHistory(jobId) {
  return request({ url: `/api/scheduler/jobs/${jobId}/history`, method: 'get' })
}
