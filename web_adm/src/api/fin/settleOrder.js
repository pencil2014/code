import request from '@/utils/request'

export function generateSettleOrder(data) {
  return request({
    url: '/fin/settleOrder/generateSettleOrder',
    method: 'post',
    data
  })
}
export function settleOrderSave(data) {
  return request({
    url: '/fin/settleOrder/settleOrderSave',
    method: 'post',
    data
  })
}
export function listPage(data) {
  return request({
    url: '/fin/settleOrder/listPage',
    method: 'post',
    data
  })
}
export function settleOrderAdd(data) {
  return request({
    url: '/fin/settleOrder/settleOrderAdd',
    method: 'post',
    data
  })
}
export function listAddFeePage(data) {
  return request({
    url: '/fin/settleOrder/listAddFeePage',
    method: 'post',
    data
  })
}
export function listAddAllFee(data) {
  return request({
    url: '/fin/settleOrder/listAddAllFee',
    method: 'post',
    data
  })
}
export function info(data) {
  return request({
    url: '/fin/settleOrder/info',
    method: 'post',
    data
  })
}
export function settleOrderUpdate(data) {
  return request({
    url: '/fin/settleOrder/settleOrderUpdate',
    method: 'post',
    data
  })
}
export function close(data) {
  return request({
    url: '/fin/settleOrder/close',
    method: 'post',
    data
  })
}
export function merge(data) {
  return request({
    url: '/fin/settleOrder/merge',
    method: 'post',
    data
  })
}
export function settleOrderFeeStatistics(data) {
  return request({
    url: '/fin/settleOrder/settleOrderFeeStatistics',
    method: 'post',
    data
  })
}
export function invoiceConfirm(data) {
  return request({
    url: '/fin/settleOrder/invoiceConfirm',
    method: 'post',
    data
  })
}
export function settleOrderInvoiceFeeList(data) {
  return request({
    url: '/fin/settleOrder/settleOrderInvoiceFeeList',
    method: 'post',
    data
  })
}
export function settleOrderAgentConfirm(data) {
  return request({
    url: '/fin/settleOrder/settleOrderAgentConfirm',
    method: 'post',
    data
  })
}
export function settleOrderAgentCancel(data) {
  return request({
    url: '/fin/settleOrder/settleOrderAgentCancel',
    method: 'post',
    data
  })
}
export function confirm(data) {
  return request({
    url: '/fin/settleOrder/confirm',
    method: 'post',
    data
  })
}
export function getListAmtSummary(data) {
  return request({
    url: '/fin/settleOrder/getListAmtSummary',
    method: 'post',
    data
  })
}
// 上传水单
export function relationPayInfo(data) {
  return request({
    url: '/fin/settleOrderPayRelation/relationPayInfo',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  })
}
// 编辑
export function delelteRelationPayInfo(data) {
  return request({
    url: '/fin/settleOrderPayRelation/delelteRelationPayInfo',
    method: 'post',
    data
  })
}
// 撤销确认结算单
export function cancelConfirm(data) {
  return request({
    url: '/fin/settleOrder/cancelConfirm',
    method: 'post',
    data
  })
}
// 应收汇率调整
export function adjustSettleOrderExchangeRate(data) {
  return request({
    url: '/fin/settleOrder/adjustSettleOrderExchangeRate',
    method: 'post',
    data
  })
}
// 自动分配金额
export function autoCompulateSettleFee(data) {
  return request({
    url: '/fin/settleOrder/autoCompulateSettleFee',
    method: 'post',
    data
  })
}
// 自动分配金额
export function toQuickRecvWriteoff(data) {
  return request({
    url: '/fin/settleOrder/toQuickRecvWriteoff',
    method: 'post',
    data
  })
}
// 结算单添加费用 汇总
export function listAddFeeSummary(data) {
  return request({
    url: '/fin/settleOrder/listAddFeeSummary',
    method: 'post',
    data
  })
}
// 结算单关联应付发票
export function relationInvoicePayment(data) {
  return request({
    url: '/fin/settleOrder/relationInvoicePayment',
    method: 'post',
    data
  })
}
// 释放结算单
export function releaseSettleOrder(data) {
  return request({
    url: '/fin/settleOrder/releaseSettleOrder',
    method: 'post',
    data
  })
}
// 拆分结算单
export function splitSettleOrder(data) {
  return request({
    url: '/fin/settleOrder/splitSettleOrder',
    method: 'post',
    data
  })
}
// 校验结算单是否可以代收付
export function settleOrderAgentConfirmValidate(data) {
  return request({
    url: '/fin/settleOrder/settleOrderAgentConfirmValidate',
    method: 'post',
    data
  })
}