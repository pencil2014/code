import request from '@/utils/request'
// 跟进协同单号获取单证
export function getJointDocs(data) {
  return request({
    url: '/order/shipping/express/getJointDocs',
    method: 'post',
    data
  })
}
// 寄单列表
export function postList(data) {
  return request({
    url: '/order/shipping/post/list',
    method: 'post',
    data
  })
}
// 寄单列表V2.0
export function expressList(data) {
  return request({
    url: '/order/shipping/express/list',
    method: 'post',
    data
  })
}
// 寄单保存
export function postSave(data) {
  return request({
    url: '/order/shipping/post/save',
    method: 'post',
    data
  })
}
// 寄单保存(新)
export function expressSave(data) {
  return request({
    url: '/order/shipping/express/save',
    method: 'post',
    data
  })
}
// 寄单删除
export function postDelete(data) {
  return request({
    url: '/order/shipping/post/delete',
    method: 'post',
    data
  })
}
// 寄单删除(新)
export function expressDelete(data) {
  return request({
    url: '/order/shipping/express/delete',
    method: 'post',
    data
  })
}
// 寄单状态修改
export function postUpdateStatus(data) {
  return request({
    url: '/order/shipping/post/updateStatus',
    method: 'post',
    data
  })
}
// 寄单状态修改(新)
export function expressUpdateStatus(data) {
  return request({
    url: '/order/shipping/express/updateStatus',
    method: 'post',
    data
  })
}
// 寄单详情
export function postDetail(data) {
  return request({
    url: '/order/shipping/post/detail',
    method: 'post',
    data
  })
}
// 寄单详情(新)
export function expressDetail(data) {
  return request({
    url: '/order/shipping/express/detail',
    method: 'post',
    data
  })
}
// 获取订单单证
export function getOrderDocs(data) {
  return request({
    url: '/order/shipping/post/getOrderDocs',
    method: 'post',
    data
  })
}
// 获取订单单证(新)
export function getExpressDocs(data) {
  return request({
    url: '/order/shipping/express/getOrderDocs',
    method: 'post',
    data
  })
}
// 费用确认
export function expressConfirmFee(data) {
  return request({
    url: '/order/shipping/express/confirmFee',
    method: 'post',
    data
  })
}
// 快递单导入
export function expressImportExcel(data) {
  return request({
    url: '/order/shipping/express/importExcel',
    method: 'post',
    data
  })
}
// 模板文件下载 
export function expressFileTempDownload(data) {
  return request({
    url: '/order/shipping/express/file/temp/download',
    method: 'post',
    data
  })
}
