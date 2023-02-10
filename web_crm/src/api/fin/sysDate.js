import request from '@/utils/request'

// 当前的财务日期
export function getSysDate(data) {
  return request({
    url: '/fin/sysDate/getSysDate',
    method: 'post',
    data
  })
}