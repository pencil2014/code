import request from '@/utils/request'

// 跟进列表表头 /order/follow/title/list
export function getFollowTitleList(data) {
  return request({
    url: '/order/follow/title/list',
    method: 'post',
    data
  })
}

// 跟进列表表头保存 /order/follow/title/save
export function followTitleSave(data) {
  return request({
    url: '/order/follow/title/save',
    method: 'post',
    data
  })
}

// 跟进列表 /order/follow/list
export function getOrderFollowList(data) {
  return request({
    url: '/order/follow/list',
    method: 'post',
    data
  })
}

// 手动跟进项完成 /order/follow/finish
export function orderFollowFinish(data) {
  return request({
    url: '/order/follow/finish',
    method: 'post',
    data
  })
}

// 手动跟进项取消 /order/follow/cancel
export function orderFollowCancel(data) {
  return request({
    url: '/order/follow/cancel',
    method: 'post',
    data
  })
}

// 获取收发通信息 /order/follow/transport
export function getOrderFollowTransport(data) {
  return request({
    url: '/order/follow/transport',
    method: 'post',
    data
  })
}

// 个人备注保存 /order/follow/remark/save
export function followRemarkSave(data) {
  return request({
    url: '/order/follow/remark/save',
    method: 'post',
    data
  })
}

// 放货备注保存 /order/follow/putRemark/save
export function followPutRemarkSave(data) {
  return request({
    url: '/order/follow/putRemark/save',
    method: 'post',
    data
  })
}

// 批复说明修改 /order/follow/freetime/save
export function followFreetimeSave(data) {
  return request({
    url: '/order/follow/freetime/save',
    method: 'post',
    data
  })
}

// 跟进信息保存 /order/follow/data/save
export function followDataSave(data) {
  return request({
    url: '/order/follow/data/save',
    method: 'post',
    data
  })
}

// 成本卖价利润查询 /order/follow/profit
export function getOrderFollowProfit(data) {
  return request({
    url: '/order/follow/profit',
    method: 'post',
    data
  })
}

// 成本卖价利润中的数据修改 /order/follow/cargoValue/save
export function followCargoValueSave(data) {
  return request({
    url: '/order/follow/cargoValue/save',
    method: 'post',
    data
  })
}

// 跟进列表总状态 /order/follow/listStatus
export function getOrderFollowListStatus(data) {
  return request({
    url: '/order/follow/listStatus',
    method: 'post',
    data
  })
}
