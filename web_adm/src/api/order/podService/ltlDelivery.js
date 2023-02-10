import request from '@/utils/request'

// 散车派送委托列表
export function ltlIntrustList(data) {
  return request({
    url: '/order/shipping/delivery/ltl/intrust/list',
    method: 'post',
    data
  })
}
// 散车派送委托列表带装货信息
export function ltlIntrustListWithLoadInfo(data) {
  return request({
    url: '/order/shipping/delivery/ltl/intrust/listWithLoadInfo',
    method: 'post',
    data
  })
}

// 散车派送委托编号
export function ltlReqno(data) {
  return request({
    url: '/order/shipping/delivery/ltl/reqno',
    method: 'post',
    data
  })
}

// 散车派送委托保存
export function ltlIntrustSave(data) {
  return request({
    url: '/order/shipping/delivery/ltl/intrust/save',
    method: 'post',
    data
  })
}

// 散车派送委托删除
export function ltlIntrustDelete(data) {
  return request({
    url: '/order/shipping/delivery/ltl/intrust/delete',
    method: 'post',
    data
  })
}

// 散车派送详情
export function ltlIntrustInfo(data) {
  return request({
    url: '/order/shipping/delivery/ltl/intrust/info',
    method: 'post',
    data
  })
}
// 散车派送复制
export function ltlIntrustCopy(data) {
  return request({
    url: '/order/shipping/delivery/ltl/intrust/copy',
    method: 'post',
    data
  })
}

// 散车派送状态变更
export function ltlStatusChange(data) {
  return request({
    url: '/order/shipping/delivery/ltl/status/change',
    method: 'post',
    data
  })
}

// 散车派送文件签收
export function ltlFileUpload(data) {
  return request({
    url: '/order/shipping/delivery/ltl/file/upload',
    method: 'post',
    data
  })
}

// 签收文件删除
export function ltlFileDelete(data) {
  return request({
    url: '/order/shipping/delivery/ltl/file/delete',
    method: 'post',
    data
  })
}