import request from '@/utils/request'

export function listPage(data) {
  return request({
    url: '/fin/writeoffNopay/gedging/listPage',
    method: 'post',
    data
  })
}
export function updateWriteoffDate(data) {
  return request({
    url: '/fin/writeoffNopay/updateWriteoffDate',
    method: 'post',
    data
  })
}
export function getListAmtSummary(data) {
  return request({
    url: '/fin/writeoffNopay/gedging/getListAmtSummary',
    method: 'post',
    data
  })
}
export function exListPage(data) {
  return request({
    url: '/fin/writeoffNopay/gedging/exListPage',
    method: 'post',
    data
  })
}
export function getExListAmtSummary(data) {
  return request({
    url: '/fin/writeoffNopay/gedging/getExListAmtSummary',
    method: 'post',
    data
  })
}