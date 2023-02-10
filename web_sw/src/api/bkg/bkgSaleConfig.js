import request from '@/utils/request'

// feetime列表
export function freetimeListPage(data) {
  return request({
    url: '/bkg/freetime/listPage',
    method: 'post',
    data
  })
}
// feetime保存修改
export function freetimeSave(data) {
  return request({
    url: '/bkg/freetime/save',
    method: 'post',
    data
  })
}
// feetime删除
export function freetimeDelete(data) {
  return request({
    url: '/bkg/freetime/delete',
    method: 'post',
    data
  })
}
// 退舱列表
export function bkgCancelListPage(data) {
  return request({
    url: '/bkg/bkgCancelFee/listPage',
    method: 'post',
    data
  })
}
//  退舱保存修改
export function bkgCancelFeeSave(data) {
  return request({
    url: '/bkg/bkgCancelFee/save',
    method: 'post',
    data
  })
}
//  退舱保存修改
export function bkgCancelFeeDelete(data) {
  return request({
    url: '/bkg/bkgCancelFee/delete',
    method: 'post',
    data
  })
}
//  舱位预测列表
export function forecastListPage(data) {
  return request({
    url: '/bkg/forecast/listPage',
    method: 'post',
    data
  })
}
//  舱位预测保存修改
export function forecastSave(data) {
  return request({
    url: '/bkg/forecast/save',
    method: 'post',
    data
  })
}
//  舱位预测审核通过
export function forecastPass(data) {
  return request({
    url: '/bkg/forecast/pass',
    method: 'post',
    data
  })
}
//  舱位预测审核拒绝
export function forecastRefuse(data) {
  return request({
    url: '/bkg/forecast/refuse',
    method: 'post',
    data
  })
}
//  舱位预测删除
export function forecastDelete(data) {
  return request({
    url: '/bkg/forecast/delete',
    method: 'post',
    data
  })
}
//  商务统计列表
export function forecastStatistic(data) {
  return request({
    url: '/bkg/forecast/statistic',
    method: 'post',
    data
  })
}

//  商务下拉
export function sleList(data) {
  return request({
    url: '/bkg/sle/list',
    method: 'post',
    data
  })
}
