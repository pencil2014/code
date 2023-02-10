import request from '@/utils/request'

export function usaFeeCompareList(data) {
  return request({
    url: '/fin/usaFeeCompare/listPage',
    method: 'post',
    data
  })
}
export function doCompare(data) {
  return request({
    url: '/fin/usaFeeCompare/doCompare',
    method: 'post',
    data
  })
}
export function markDzgFee(data) {
  return request({
    url: '/fin/usaFeeCompare/markDzgFee',
    method: 'post',
    data
  })
}