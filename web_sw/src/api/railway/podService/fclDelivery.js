import request from '@/utils/request'

// 拖柜派送委托列表
export function fclIntrustList(data) {
  return request({
    url: '/order/shipping/delivery/fcl/intrust/list',
    method: 'post',
    data
  })
}

// 拖柜派送委托编号
export function fclReqno(data) {
  return request({
    url: '/order/shipping/delivery/fcl/reqno',
    method: 'post',
    data
  })
}

// 拖柜派送委托保存
export function fclIntrustSave(data) {
  return request({
    url: '/order/shipping/delivery/fcl/intrust/save',
    method: 'post',
    data
  })
}

// 拖柜派送委托删除
export function fclIntrustDelete(data) {
  return request({
    url: '/order/shipping/delivery/fcl/intrust/delete',
    method: 'post',
    data
  })
}

// 拖柜派送详情
export function fclIntrustInfo(data) {
  return request({
    url: '/order/shipping/delivery/fcl/intrust/info',
    method: 'post',
    data
  })
}

// 拖柜派送状态变更
export function fclStatusChange(data) {
  return request({
    url: '/order/shipping/delivery/fcl/status/change',
    method: 'post',
    data
  })
}

// 拖柜派送文件签收
export function fclFileUpload(data) {
  return request({
    url: '/order/shipping/delivery/fcl/file/upload',
    method: 'post',
    data
  })
}

// 拖柜派送配载保存
export function fclLoadSave(data) {
  return request({
    url: '/order/shipping/delivery/fcl/load/save',
    method: 'post',
    data
  })
}

// 拖柜派送配载删除
export function fclLoadDelete(data) {
  return request({
    url: '/order/shipping/delivery/fcl/load/delete',
    method: 'post',
    data
  })
}

// 签收文件删除
export function fclFileDelete(data) {
  return request({
    url: '/order/shipping/delivery/fcl/file/delete',
    method: 'post',
    data
  })
}