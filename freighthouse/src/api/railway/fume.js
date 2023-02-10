import request from '@/utils/request'

// 熏蒸列表
export function fumeList(data) {
  return request({
    url: '/order/shipping/fume/list',
    method: 'post',
    data
  })
}

// 熏蒸详情
export function fumeDetail(data) {
  return request({
    url: '/order/shipping/fume/detail',
    method: 'post',
    data
  })
}

// 熏蒸保存
export function fumeSave(data) {
  return request({
    url: '/order/shipping/fume/save',
    method: 'post',
    data
  })
}

// 熏蒸删除
export function fumeDelete(data) {
  return request({
    url: '/order/shipping/fume/delete',
    method: 'post',
    data
  })
}

// 熏蒸单号获取
export function fumeCreateSerialNo(data) {
  return request({
    url: '/order/shipping/fume/createSerialNo',
    method: 'post',
    data
  })
}

// 熏蒸上传文件
export function fumeUploadFile(data) {
  return request({
    url: '/order/shipping/fume/uploadFile',
    method: 'post',
    data
  })
}

// 熏蒸上传文件
export function fumeUpdateStatus(data) {
  return request({
    url: '/order/shipping/fume/updateStatus',
    method: 'post',
    data
  })
}