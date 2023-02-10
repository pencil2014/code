import request from '@/utils/request'

export function listAllotPage(data) {
  return request({
    url: '/fin/transferFee/listAllotPage',
    method: 'post',
    data
  })
}