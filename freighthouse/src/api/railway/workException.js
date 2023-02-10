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
