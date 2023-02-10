import request from '@/utils/request'

export function listPage(data) {
  return request({
    url: '/fin/invoicePayment/listPage',
    method: 'post',
    data
  })
}
export function info(data) {
  return request({
    url: '/fin/invoicePayment/info',
    method: 'post',
    data
  })
}
export function add(data) {
  return request({
    url: '/fin/invoicePayment/add',
    method: 'post',
    data
  })
}
export function invoicePaymentUpdate(data) {
  return request({
    url: '/fin/invoicePayment/update',
    method: 'post',
    data
  })
}
export function receive(data) {
  return request({
    url: '/fin/invoicePayment/receive',
    method: 'post',
    data
  })
}
export function relatePayInfo(data) {
  return request({
    url: '/fin/invoicePayment/relatePayInfo',
    method: 'post',
    data
  })
}
export function del(data) {
  return request({
    url: '/fin/invoicePayment/delete',
    method: 'post',
    data
  })
}
export function listPayInfo(data) {
  return request({
    url: '/fin/invoicePayment/listPayInfo',
    method: 'post',
    data
  })
}
export function usableList(data) {
  return request({
    url: '/fin/invoicePayment/usableList',
    method: 'post',
    data
  })
}
export function getListAmtSummary(data) {
  return request({
    url: '/fin/invoicePayment/getListAmtSummary',
    method: 'post',
    data
  })
}
export function uploadInvoiceImg(data) {
  return request({
    url: '/fin/invoicePayment/uploadInvoiceImg',
    method: 'post',
    data,
    headers: { 'Content-Type': 'multipart/form-data', }
  })
}
export function batchImport(data) {
  return request({
    url: '/fin/invoicePayment/batchImport',
    method: 'post',
    data,
    headers: { 'Content-Type': 'multipart/form-data', }
  })
}
//上传发票查验件
export function uploadCheckInvoiceImg(data) {
  return request({
    url: '/fin/invoicePayment/uploadCheckInvoiceImg',
    method: 'post',
    data,
    headers: { 'Content-Type': 'multipart/form-data', }
  })
}
// 应付发票pdf文件识别
export function uploadInvoiceFileAndOcr(data) {
  return request({
    url: '/fin/invoicePayment/uploadInvoiceFileAndOcr',
    method: 'post',
    data,
    headers: { 'Content-Type': 'multipart/form-data', }
  })
}
// 应付发票打印确认
export function invoicePrintConfirm(data) {
  return request({
    url: '/fin/invoicePayment/printConfirm',
    method: 'post',
    data,
  })
}