import request from '@/utils/request'

// obd利润列表
export function obdProfitListPage(data) {
  return request({
    url: '/fin/profit/obdProfitListPage',
    method: 'post',
    data
  })
}
// obd利润明细列表
export function obdProfitDetailListPage(data) {
  return request({
    url: '/fin/profit/obdProfitDetailListPage',
    method: 'post',
    data
  })
}