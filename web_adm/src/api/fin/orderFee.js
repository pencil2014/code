import request from '@/utils/request'

export function feeAdjustRoleJobList(data) {
  return request({
    url: '/fin/orderFee/feeAdjustRoleJobList',
    method: 'post',
    data
  })
}
export function checkFeeCompleted(data) {
  return request({
    url: '/fin/orderFee/checkFeeCompleted',
    method: 'post',
    data
  })
}
export function updateOrderFeeTaxRate(data) {
  return request({
    url: '/fin/orderFee/updateOrderFeeTaxRate',
    method: 'post',
    data
  })
}
// 获取预关账申请列表（负利润的）
export function orderPrecloseApplyList(data) {
  return request({
    url: '/fin/orderFee/orderPrecloseApplyList',
    method: 'post',
    data
  })
}