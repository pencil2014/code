import request from '@/utils/request'

export function queryPayOrderByWriteoffNo(data) {
  return request({
    url: '/fin/writeoffPay/queryPayOrderByWriteoffNo',
    method: 'post',
    data
  })
}
//并行大掌柜核销统计查询
export function queryWriteoffDzgMonitorPageList(data) {
  return request({
    url: '/fin/writeoffPay/queryWriteoffDzgMonitorPageList',
    method: 'post',
    data
  })
}