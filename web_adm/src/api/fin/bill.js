import request from '@/utils/request'

export function billList(data) {
  return request({
    url: '/fin/bill/list',
    method: 'post',
    data
  })
}
export function getBillDetail(data) {
  return request({
    url: '/fin/bill/getBillDetail',
    method: 'post',
    data
  })
}
export function exportBill(data) {
  return request({
    url: '/fin/bill/exportBill',
    method: 'get',
    data
  })
}
export function sendBillMail(data) {
  return request({
    url: '/fin/bill/sendBillMail',
    method: 'post',
    data
  })
}
export function print(data) {
  return request({
    url: '/fin/bill/print',
    method: 'post',
    data
  })
}
export function generateBill(data) {
  return request({
    url: '/fin/bill/generateBill',
    method: 'post',
    data
  })
}
export function customerConfirm(data) {
  return request({
    url: '/fin/bill/customerConfirm',
    method: 'post',
    data
  })
}
export function billGenerateSo(data) {
  return request({
    url: '/fin/bill/billGenerateSo',
    method: 'post',
    data
  })
}
export function invoiceConfirm(data) {
  return request({
    url: '/fin/bill/invoiceConfirm',
    method: 'post',
    data
  })
}
export function listPage(data) {
  return request({
    url: '/fin/bill/listPage',
    method: 'post',
    data
  })
}
// 账单-月结账单列表
export function settleOrderBillList(data) {
  return request({
    url: '/fin/bill/settleOrderBill/listPage',
    method: 'post',
    data
  })
}
// 账单-单票账单列表金额汇总
export function getListAmtSummary(data) {
  return request({
    url: '/fin/bill/getListAmtSummary',
    method: 'post',
    data
  })
}
// 账单-月结账单列表金额汇总
export function getListAmtSummary2(data) {
  return request({
    url: '/fin/bill/settleOrderBill/getListAmtSummary',
    method: 'post',
    data
  })
}
// 结算单对账单列表单票账单批量打印详情
export function getBillDetailBacth(data) {
  return request({
    url: '/fin/bill/getBillDetailBacth',
    method: 'post',
    data
  })
}
// 月结账单生成结算单
export function settleOrderBillGenerateSo(data) {
  return request({
    url: '/fin/bill/settleOrderBill/generateSettleOrder',
    method: 'post',
    data
  })
}
// 月结账单列表客户确认
export function settleOrderBillConfirm(data) {
  return request({
    url: '/fin/bill/settleOrderBill/confirm',
    method: 'post',
    data
  })
}