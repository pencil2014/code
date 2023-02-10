import request from '@/utils/request'

export function print(data) {
  return request({
    url: '/fin/invoiceReceivable/print',
    method: 'post',
    data
  })
}
export function listPage(data) {
  return request({
    url: '/fin/invoiceReceivable/listPage',
    method: 'post',
    data
  })
}
// export function cancel(data) {
//   return request({
//     url: '/fin/invoiceReceivable/cancel',
//     method: 'post',
//     data
//   })
// }
export function info(data) {
  return request({
    url: '/fin/invoiceReceivable/info',
    method: 'post',
    data
  })
}
// 关联收款单-收款登记列表查询
export function listReceivableReg(data) {
  return request({
    url: '/fin/invoiceReceivable/listReceivableReg',
    method: 'post',
    data
  })
}
// 关联收款单
export function relateReceivableReg(data) {
  return request({
    url: '/fin/invoiceReceivable/relateReceivableReg',
    method: 'post',
    data
  })
}
// 发票费用导出
export function exportFeeList(data) {
  return request({
    url: '/fin/invoiceReceivable/exportFeeList',
    method: 'post',
    data
  })
}
export function getListAmtSummary(data) {
  return request({
    url: '/fin/invoiceReceivable/getListAmtSummary',
    method: 'post',
    data
  })
}

// 发票可关联结算单列表
export function listInvoiceAbleSettleOrder(data) {
  return request({
    url: '/fin/invoiceReceivable/listInvoiceAbleSettleOrder',
    method: 'post',
    data
  })
}
// 发票关联
export function relateInvoiceFee(data) {
  return request({
    url: '/fin/invoiceReceivable/relateInvoiceFee',
    method: 'post',
    data
  })
}
// 发票已关联结算单列表
export function getRelateSettleOrderList(data) {
  return request({
    url: '/fin/invoiceReceivable/getRelateSettleOrderList',
    method: 'post',
    data
  })
}
// 取消发票关联
export function releaseInvoiceFee(data) {
  return request({
    url: '/fin/invoiceReceivable/releaseInvoiceFee',
    method: 'post',
    data
  })
}
// 开票申请审核
export function applyAudit(data) {
  return request({
    url: '/fin/invoiceReceivableApply/audit',
    method: 'post',
    data
  })
}
// 获取发票相关人
export function getInvoicePeopers(data) {
  return request({
    url: '/fin/invoiceReceivable/getInvoicePeopers',
    method: 'post',
    data
  })
}
// 电子发票邮件发送
export function sendInvoiceFile(data) {
  return request({
    url: '/fin/invoiceReceivable/sendInvoiceFile',
    method: 'post',
    data
  })
}
// 批量上传发票
export function uploadInvoiceFileBatch(data) {
  return request({
    url: '/fin/invoiceReceivable/uploadInvoiceFileBatch',
    method: 'post',
    data,
    headers: { 'Content-Type': 'multipart/form-data', }
  })
}
// 上传发票
export function uploadInvoiceFile(data) {
  return request({
    url: '/fin/invoiceReceivable/uploadInvoiceFile',
    method: 'post',
    data,
    headers: { 'Content-Type': 'multipart/form-data', }
  })
}
// 更新发票信息
export function updateManualInvoiceInfo(data) {
  return request({
    url: '/fin/invoiceReceivable/updateManualInvoiceInfo',
    method: 'post',
    data,
  })
}
// 快速收款登记
export function toQuickRecvWriteoff(data) {
  return request({
    url: '/fin/invoiceReceivable/toQuickRecvWriteoff',
    method: 'post',
    data,
  })
}
// 发票作废申请初始数据
export function toCancelApply(data) {
  return request({
    url: '/fin/invoiceReceivable/toCancelApply',
    method: 'post',
    data
  })
}
// 红冲发票申请列表
export function invoiceReceivableCancelList(data) {
  return request({
    url: '/fin/invoiceReceivableCancel/listPage',
    method: 'post',
    data
  })
}
export function getListAmtSummaryCancel(data) {
  return request({
    url: '/fin/invoiceReceivableCancel/getListAmtSummary',
    method: 'post',
    data
  })
}
// 发票作废申请
export function cancelApply(data) {
  return request({
    url: '/fin/invoiceReceivableCancel/cancelApply',
    method: 'post',
    data
  })
}
// 发票作废申请审核
export function cancelAudit(data) {
  return request({
    url: '/fin/invoiceReceivableCancel/audit',
    method: 'post',
    data
  })
}
// 发票冲红作废确定
export function cancel(data) {
  return request({
    url: '/fin/invoiceReceivableCancel/cancel',
    method: 'post',
    data
  })
}
// 发票冲红作废详情
export function cancelInfo(data) {
  return request({
    url: '/fin/invoiceReceivableCancel/info',
    method: 'post',
    data
  })
}