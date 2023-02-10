import request from '@/utils/request'

// 通知列表
export function noticeList(data) {
  return request({
    url: '/order/notice/list',
    method: 'post',
    data
  })
}
// 通知详情
export function noticeDetail(data) {
  return request({
    url: '/order/notice/detail',
    method: 'post',
    data
  })
}