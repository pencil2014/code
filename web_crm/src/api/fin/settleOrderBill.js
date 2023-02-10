import request from '@/utils/request'

export function listPage(data) {
  return request({
    url: '/fin/settleOrderBill/listPage',
    method: 'post',
    data
  })
}
export function info(data) {
  return request({
    url: '/fin/settleOrderBill/info',
    method: 'post',
    data
  })
}
export function settleOrderBillExport(data) {
  return request({
    url: '/fin/settleOrderBill/export',
    method: 'post',
    data
  })
}
export function sendBillMail(data) {
  return request({
    url: '/fin/settleOrderBill/sendBillMail',
    method: 'post',
    data
  })
}
export function confirm(data) {
  return request({
    url: '/fin/settleOrderBill/confirm',
    method: 'post',
    data
  })
}
export function mergeBillListPage(data) {
  return request({
    url: '/fin/settleOrderBill/mergeBillListPage',
    method: 'post',
    data
  })
}
export function mergeDzgBill(data) {
  return request({
    url: '/fin/settleOrderBill/mergeDzgBill',
    method: 'post',
    data
  })
}
export function changeFeeMode(data) {
  return request({
    url: '/fin/settleOrderBill/changeFeeMode',
    method: 'post',
    data
  })
}
// 结算单生成对账单
export function generateBill(data) {
  return request({
    url: '/fin/settleOrderBill/generateBill',
    method: 'post',
    data
  })
}
// 结算单对账单列表-票结账单
export function billListPage(data) {
  return request({
    url: '/fin/settleOrderBill/billListPage',
    method: 'post',
    data
  })
}