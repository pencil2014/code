import request from '@/utils/request'

export function saveOrderBizFee(data) {
  return request({
    url: '/fin/feeAdjust/saveOrderBizFee',
    method: 'post',
    data
  })
}
export function saveOrderSpecialFee(data) {
  return request({
    url: '/fin/feeAdjust/saveOrderSpecialFee',
    method: 'post',
    data
  })
}
export function saveFinBillFee(data) {
  return request({
    url: '/fin/feeAdjust/saveFinBillFee',
    method: 'post',
    data
  })
}
export function orderFeeAdjustList(data) {
  return request({
    url: '/fin/feeAdjust/orderFeeAdjustList',
    method: 'post',
    data
  })
}
export function adjustAudit(data) {
  return request({
    url: '/fin/feeAdjust/adjustAudit',
    method: 'post',
    data
  })
}
export function adjustAuditCancel(data) {
  return request({
    url: '/fin/feeAdjust/adjustAuditCancel',
    method: 'post',
    data
  })
}
export function orderFeeAdjustDetail(data) {
  return request({
    url: '/fin/feeAdjust/orderFeeAdjustDetail',
    method: 'post',
    data
  })
}
export function feeAdjustList(data) {
  return request({
    url: '/fin/feeAdjust/feeAdjustList',
    method: 'post',
    data
  })
}
export function getAdjustAuditEmployee(data) {
  return request({
    url: '/fin/feeAdjust/getAdjustAuditEmployee',
    method: 'post',
    data
  })
}
export function getAdjustAuditLog(data) {
  return request({
    url: '/fin/feeAdjust/getAdjustAuditLog',
    method: 'post',
    data
  })
}
export function modifyFeeAdjApprover(data) {
  return request({
    url: '/fin/feeAdjust/modifyFeeAdjApprover',
    method: 'post',
    data
  })
}
export function delFeeAdjApprover(data) {
  return request({
    url: '/fin/feeAdjust/delFeeAdjApprover',
    method: 'post',
    data
  })
}
export function orderFeeAdjustCount(data) {
  return request({
    url: '/fin/feeAdjust/orderFeeAdjustCount',
    method: 'post',
    data
  })
}