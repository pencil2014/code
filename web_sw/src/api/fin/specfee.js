import request from '@/utils/request'

export function specFeeSaveVerify(data) {
  return request({
    url: '/fin/specfee/specFeeSaveVerify',
    method: 'post',
    data
  })
}
export function specFeeMngApply(data) {
  return request({
    url: '/fin/specfee/specFeeMngApply',
    method: 'post',
    data
  })
}
export function specFeeMngApplyList(data) {
  return request({
    url: '/fin/specfee/specFeeMngApplyList',
    method: 'post',
    data
  })
}
export function applyAudit(data) {
  return request({
    url: '/fin/specfee/applyAudit',
    method: 'post',
    data
  })
}
export function saveOrderSpecialFee(data) {
  return request({
    url: '/fin/specfee/saveOrderSpecialFee',
    method: 'post',
    data
  })
}