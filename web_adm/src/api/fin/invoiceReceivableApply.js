import request from '@/utils/request'

export function listPage(data) {
  return request({
    url: '/fin/invoiceReceivableApply/listPage',
    method: 'post',
    data
  })
}
// 预收发票列表
export function listPrePage(data) {
  return request({
    url: '/fin/invoiceReceivableApply/listPrePage',
    method: 'post',
    data
  })
}
export function createPaperInvoiceBatch(data) {
  return request({
    url: '/fin/invoiceReceivableApply/createPaperInvoiceBatch',
    method: 'post',
    data
  })
}
export function close(data) {
  return request({
    url: '/fin/invoiceReceivableApply/close',
    method: 'post',
    data
  })
}
export function registerInvoice(data) {
  return request({
    url: '/fin/invoiceReceivableApply/registerInvoice',
    method: 'post',
    data
  })
}
export function createElectronicInvoiceBatch(data) {
  return request({
    url: '/fin/invoiceReceivableApply/createElectronicInvoiceBatch',
    method: 'post',
    data
  })
}
export function getSettleUnitInvoiceInfo(data) {
  return request({
    url: '/fin/invoiceReceivableApply/getSettleUnitInvoiceInfo',
    method: 'post',
    data
  })
}
export function settleOrderFeeList(data) {
  return request({
    url: '/fin/invoiceReceivableApply/settleOrderFeeList',
    method: 'post',
    data
  })
}
export function invoiceApplySave(data) {
  return request({
    url: '/fin/invoiceReceivableApply/invoiceApplySave',
    method: 'post',
    data
  })
}
export function previewPrint(data) {
  return request({
    url: '/fin/invoiceReceivableApply/previewPrint',
    method: 'post',
    data
  })
}
export function getPaperInvoiceList(data) {
  return request({
    url: '/fin/invoiceReceivableApply/getPaperInvoiceList',
    method: 'post',
    data
  })
}
export function info(data) {
  return request({
    url: '/fin/invoiceReceivableApply/info',
    method: 'post',
    data
  })
}
// 开票申请费用导出
export function exportFeeList(data) {
  return request({
    url: '/fin/invoiceReceivableApply/exportFeeList',
    method: 'post',
    data
  })
}
export function getListAmtSummary(data) {
  return request({
    url: '/fin/invoiceReceivableApply/getListAmtSummary',
    method: 'post',
    data
  })
}
// 预收款开票申请
export function toPreInvoice(data) {
  return request({
    url: '/fin/invoiceReceivableApply/toPreInvoice',
    method: 'post',
    data
  })
}