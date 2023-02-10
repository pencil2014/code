import request from '@/utils/request'

//限重列表
export function weightLimitChargeList(data) {
  return request({
    url: '/charge/weightLimitCharge/list',
    method: 'post',
    data
  })
}

//限重新增
export function weightLimitChargeAdd(data) {
  return request({
    url: '/charge/weightLimitCharge/add',
    method: 'post',
    data
  })
}
//限重修改
export function weightLimitChargeUpdate(data) {
  return request({
    url: '/charge/weightLimitCharge/update',
    method: 'post',
    data
  })
}
//限重费删除
export function weightLimitChargeDelete(data) {
  return request({
    url: '/charge/weightLimitCharge/delete',
    method: 'post',
    data
  })
}
//限重费详情修改
export function weightLimitChargeInfo(data) {
  return request({
    url: '/charge/weightLimitCharge/info',
    method: 'post',
    data
  })
}

//限重费导出
export function weightLimitChargeExport(data) {
  return request({
    url: '/charge/weightLimitCharge/export',
    method: 'post',
    data
  })
}
//修改拿价人
export function multUpdatePricer(data) {
  return request({
    url: '/charge/weightLimitCharge/multUpdatePricer',
    method: 'post',
    data
  })
}
