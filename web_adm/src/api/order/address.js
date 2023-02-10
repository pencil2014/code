import request from '@/utils/request'
//国内外地址
export function orderAddressRegion(data) {
  return request({
    url: '/order/address/region',
    method: 'post',
    data
  })
}
//地址模版列表
export function orderAddressList(data) {
  return request({
    url: '/order/address/list',
    method: 'post',
    data
  })
}
// 新增地址模版
export function orderAddressAdd(data) {
  return request({
    url: '/order/address/add',
    method: 'post',
    data
  })
}
// 更新地址模版
export function orderAddressUpdate(data) {
  return request({
    url: '/order/address/update',
    method: 'post',
    data
  })
}
//删除地址模版
export function orderAddressDel(data) {
  return request({
    url: '/order/address/del',
    method: 'post',
    data
  })
}