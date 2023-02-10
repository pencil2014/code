import request from '@/utils/request'

export function custOverduePaymentList(data) {
  return request({
    url: '/fin/custOverduePayment/listPage',
    method: 'post',
    data
  })
}
export function listPageSummary(data) {
  return request({
    url: '/fin/custOverduePayment/listPageSummary',
    method: 'post',
    data
  })
}
export function listDeductionApplyPage(data) {
  return request({
    url: '/fin/custOverduePayment/listDeductionApplyPage',
    method: 'post',
    data
  })
}
export function deductionApplyAudit(data) {
  return request({
    url: '/fin/custOverduePayment/deductionApplyAudit',
    method: 'post',
    data
  })
}
export function deductionApply(data) {
  return request({
    url: '/fin/custOverduePayment/deductionApply',
    method: 'post',
    data
  })
}
export function lateFeeReceive(data) {
  return request({
    url: '/fin/custOverduePayment/receive',
    method: 'post',
    data
  })
}
export function getDeductionApplyInfo(data) {
  return request({
    url: '/fin/custOverduePayment/getDeductionApplyInfo',
    method: 'post',
    data
  })
}
export function custOverduePaymentInfo(data) {
  return request({
    url: '/fin/custOverduePayment/getInfo',
    method: 'post',
    data
  })
}
// 滞纳金确认撤销
export function withdrawalConfirm(data) {
  return request({
    url: '/fin/custOverduePayment/withdrawalConfirm',
    method: 'post',
    data
  })
}
// 收款核销时查询滞纳金
export function listBeforeWriteoff(data) {
  return request({
    url: '/fin/custOverduePayment/listBeforeWriteoff',
    method: 'post',
    data
  })
}
// 根据核销单号查询滞纳金
export function listByWriteoffNo(data) {
  return request({
    url: '/fin/custOverduePayment/listByWriteoffNo',
    method: 'post',
    data
  })
}
// 滞纳金费用详情（分页）
export function getCustOverdueFeeList(data) {
  return request({
    url: '/fin/custOverduePayment/getCustOverdueFeeList',
    method: 'post',
    data
  })
}
// 滞纳金详情费用列表汇总接口
export function feeListPageSummary(data) {
  return request({
    url: '/fin/custOverduePayment/feeListPageSummary',
    method: 'post',
    data
  })
}