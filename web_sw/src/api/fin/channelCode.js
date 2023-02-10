import request from '@/utils/request'

// 标识码列表
export function listPage(data) {
  return request({
    url: '/fin/channelCodeLimit/listPage',
    method: 'post',
    data
  })
}

// 保存标识码
export function save(data) {
  return request({
    url: '/fin/channelCodeLimit/save',
    method: 'post',
    data
  })
}

// 标识码启用禁用
export function actived(data) {
  return request({
    url: '/fin/channelCodeLimit/actived',
    method: 'post',
    data
  })
}

// 标识码下拉选择
export function limitList(data) {
  return request({
    url: '/fin/channelCodeLimit/limitList',
    method: 'post',
    data
  })
}