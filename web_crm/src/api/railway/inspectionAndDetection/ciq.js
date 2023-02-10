import request from '@/utils/request'

// CIQ委托信息列表
export function ciqList(data) {
  return request({
    url: '/order/shipping/ciq/list',
    method: 'post',
    data
  })
}

// 获取CIQ委托编号
export function ciqGetIntrustNo(data) {
  return request({
    url: '/order/shipping/ciq/getIntrustNo',
    method: 'post',
    data
  })
}

// 新增CIQ委托信息
export function ciqSave(data) {
  return request({
    url: '/order/shipping/ciq/save',
    method: 'post',
    data
  })
}

// CIQ委托信息状态修改
export function ciqUpdateStatus(data) {
  return request({
    url: '/order/shipping/ciq/updateStatus',
    method: 'post',
    data
  })
}

// CIQ委托信息删除
export function ciqDelete(data) {
  return request({
    url: '/order/shipping/ciq/delete',
    method: 'post',
    data
  })
}

// CIQ详情
export function ciqDetail(data) {
  return request({
    url: '/order/shipping/ciq/detail',
    method: 'post',
    data
  })
}

// CIQ委托信息附件列表
export function ciqFileList(data) {
  return request({
    url: '/order/shipping/ciq/fileList',
    method: 'post',
    data
  })
}

// CIQ委托信息删除附件
export function ciqDeleteFile(data) {
  return request({
    url: '/order/shipping/ciq/deleteFile',
    method: 'post',
    data
  })
}