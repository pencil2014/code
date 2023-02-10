import request from '@/utils/request'

// 异常列表
export function workExceptionList(data) {
  return request({
    url: '/order/shipping/workException/list',
    method: 'post',
    data
  })
}

// 异常保存
export function workExceptionSave(data) {
  return request({
    url: '/order/shipping/workException/save',
    method: 'post',
    data
  })
}

// 异常项保存
export function workExceptionSaveItem(data) {
  return request({
    url: '/order/shipping/workException/saveItem',
    method: 'post',
    data
  })
}

// 异常跟进保存
export function workExceptionSaveProgress(data) {
  return request({
    url: '/order/shipping/workException/saveProgress',
    method: 'post',
    data
  })
}

// 异常删除
export function workExceptionDelete(data) {
  return request({
    url: '/order/shipping/workException/delete',
    method: 'post',
    data
  })
}

// 异常项删除
export function workExceptionDeleteItem(data) {
  return request({
    url: '/order/shipping/workException/deleteItem',
    method: 'post',
    data
  })
}

// 异常删除
export function workExceptionDeleteProgress(data) {
  return request({
    url: '/order/shipping/workException/deleteProgress',
    method: 'post',
    data
  })
}

// 异常状态修改
export function workExceptionUpdateStatus(data) {
  return request({
    url: '/order/shipping/workException/updateStatus',
    method: 'post',
    data
  })
}

// 异常详情
export function workExceptionDetail(data) {
  return request({
    url: '/order/shipping/workException/detail',
    method: 'post',
    data
  })
}

// 上传文件
export function workExceptionUploadFile(data) {
  return request({
    url: '/order/shipping/workException/uploadFile',
    method: 'post',
    data
  })
}

// 生成异常编号
export function getSerialNo(data) {
  return request({
    url: '/order/shipping/workException/getSerialNo',
    method: 'post',
    data
  })
}

// 异常状态修改
export function updateItemStatus(data) {
  return request({
    url: '/order/shipping/workException/updateItemStatus',
    method: 'post',
    data
  })
}
// 异常列表导出
export function workExceptionListExport(data) {
   return request({
    url: '/order/shipping/workException/list/export',
		method: 'post',
		data
   })
}
// 异常类型查询 /order/shipping/workException/type/list
export function getWorkExceptionTypeList(data) {
  return request({
    url: `/order/shipping/workException/type/list`,
    method: 'post',
    data
  })
}

// 异常原因查询 /order/shipping/workException/reason/list
export function getWorkExceptionReasonList(data) {
  return request({
    url: `/order/shipping/workException/reason/list`,
    method: 'post',
    data
  })
}
// 工作号模糊查询 order/shipping/workException/getOrderNoList
export function getOrderNoList(data) {
  return request({
    url: '/order/shipping/workException/getOrderNoList',
    method: 'post',
    data
  })
}
// 工作号查询服务类型和服务项 order/shipping/workException/getInfoByOrderNo
export function getInfoByOrderNo(data) {
  return request({
    url: '/order/shipping/workException/getInfoByOrderNo',
    method: 'post',
    data
  })
}
// 异常保存重复检查 /order/shipping/workException/saveCheck
export function workExceptionSaveCheck(data) {
  return request({
    url: '/order/shipping/workException/saveCheck',
    method: 'post',
    data
  })
}
