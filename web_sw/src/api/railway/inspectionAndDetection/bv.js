import request from '@/utils/request'

// BV委托信息列表
export function bvList(data) {
  return request({
    url: '/order/shipping/bv/list',
    method: 'post',
    data
  })
}

// 获取BV委托编号
export function bvGetIntrustNo(data) {
  let {orderNo} = data
  return request({
    url: '/order/shipping/bv/getIntrustNo?orderNo=' + orderNo,
    method: 'post',
    data: {}
  })
}

// 新增BV委托信息
export function bvSave(data) {
  return request({
    url: '/order/shipping/bv/save',
    method: 'post',
    data
  })
}

// BV委托信息状态修改
export function bvUpdateStatus(data) {
  return request({
    url: '/order/shipping/bv/updateStatus',
    method: 'post',
    data
  })
}

// BV委托信息删除
export function bvDelete(data) {
  return request({
    url: '/order/shipping/bv/delete',
    method: 'post',
    data
  })
}

// BV详情
export function bvDetail(data) {
  return request({
    url: '/order/shipping/bv/detail',
    method: 'post',
    data
  })
}

// BV委托信息附件列表
export function bvFileList(data) {
  return request({
    url: '/order/shipping/bv/fileList',
    method: 'post',
    data
  })
}

// BV委托信息删除附件
export function bvDeleteFile(data) {
  return request({
    url: '/order/shipping/bv/deleteFile',
    method: 'post',
    data
  })
}