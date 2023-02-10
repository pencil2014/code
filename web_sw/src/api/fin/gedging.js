import request from '@/utils/request'

export function listPage(data) {
  return request({
    url: '/fin/gedging/listPage',
    method: 'post',
    data
  })
}
export function applyDetailBySettleOrder(data) {
  return request({
    url: '/fin/gedging/applyDetailBySettleOrder',
    method: 'post',
    data
  })
}
export function applyDetailBySettleOrderDetail(data) {
  return request({
    url: '/fin/gedging/applyDetailBySettleOrderDetail',
    method: 'post',
    data
  })
}
export function apply(data) {
  return request({
    url: '/fin/gedging/apply',
    method: 'post',
    data
  })
}
export function audit(data) {
  return request({
    url: '/fin/gedging/audit',
    method: 'post',
    data
  })
}
export function info(data) {
  return request({
    url: '/fin/gedging/info',
    method: 'post',
    data
  })
}
export function edit(data) {
  return request({
    url: '/fin/gedging/edit',
    method: 'post',
    data
  })
}
export function autoCompulateGedgingFee(data) {
  return request({
    url: '/fin/gedging/autoCompulateGedgingFee',
    method: 'post',
    data
  })
}
export function interTransApply(data) {
  return request({
    url: '/fin/gedging/interTransApply',
    method: 'post',
    data
  })
}
export function getListAmtSummary(data) {
  return request({
    url: '/fin/gedging/getListAmtSummary',
    method: 'post',
    data
  })
}
// 对冲申请撤销
export function gedgingCancel(data) {
  return request({
    url: '/fin/gedging/cancel',
    method: 'post',
    data
  })
}
// 对冲核销备注修改
export function updateRemark(data) {
  return request({
    url: '/fin/gedging/updateRemark',
    method: 'post',
    data
  })
}

// 对冲详情 按订单号批量查询赔偿协议文件
export function orderNoFiles(data) {
  return request({
    url: '/order/file/compensation/list',
    method: 'post',
    data
  })
}