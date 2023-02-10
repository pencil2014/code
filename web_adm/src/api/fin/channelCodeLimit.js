import request from '@/utils/request'

export function limitList(data) {
  return request({
    url: '/fin/channelCodeLimit/limitList',
    method: 'post',
    data
  })
}