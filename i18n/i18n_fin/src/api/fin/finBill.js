// 财务费用单
import request from '@/utils/request'

// 费用单列表
export function listPage(data) {
  return request({
    url: '/fin/finBill/listPage',
    method: 'post',
    data
  })
}
// 费用单费用分页列表
export function queryFinBillFeePageList(data) {
  return request({
    url: '/fin/finBill/queryFinBillFeePageList',
    method: 'post',
    data
  })
}
// 费用单详情
export function getFinBillDetail(data) {
  return request({
    url: '/fin/finBill/getFinBillDetail',
    method: 'post',
    data
  })
}
// 新增费用单
export function saveFinBill(data) {
  return request({
    url: '/fin/finBill/saveFinBill',
    method: 'post',
    data
  })
}
// 费用生成结算单
export function finBillGenerateSo(data) {
  return request({
    url: '/fin/finBill/finBillGenerateSo',
    method: 'post',
    data
  })
}
// 费用单确认费用
export function confirmFee(data) {
  return request({
    url: '/fin/finBill/confirmFee',
    method: 'post',
    data
  })
}
// 费用单撤销费用
export function cancleConfirmFee(data) {
  return request({
    url: '/fin/finBill/cancleConfirmFee',
    method: 'post',
    data
  })
}
// 费用单信息
export function info(data) {
  return request({
    url: '/fin/finBill/info',
    method: 'post',
    data
  })
}
// 费用单费用-修改备注
export function updateFinBillFeeRemark(data) {
  return request({
    url: '/fin/finBill/updateFinBillFeeRemark',
    method: 'post',
    data
  })
}
// 查看费用单费用历史
export function finBillFeeHistory(data) {
  return request({
    url: '/fin/finBill/feeHistory',
    method: 'post',
    data
  })
}