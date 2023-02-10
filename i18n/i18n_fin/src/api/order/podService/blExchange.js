import request from '@/utils/request'

// 换单状态列表
export function blExchangeList(data) {
  return request({
    url: '/order/shipping/blExchange/list',
    method: 'post',
    data
  })
}
// 空运换单状态列表
export function airBlExchangeList(data) {
  return request({
    url: '/order/air/imports/blExchange/list',
    method: 'post',
    data
  })
}

// 换单状态修改
export function blExchangeUpdateStatus(data) {
  return request({
    url: '/order/shipping/blExchange/updateStatus',
    method: 'post',
    data
  })
}
// 空运换单状态修改
export function airBlExchangeUpdateStatus(data) {
  return request({
    url: '/order/air/imports/blExchange/updateStatus',
    method: 'post',
    data
  })
}

// 上传放单保函附件
export function blExchangeUploadGuarantee(data) {
  return request({
    url: '/order/shipping/blExchange/uploadGuarantee',
    method: 'post',
    data
  })
}