import request from '@/utils/request'

// 提成列表
export function listPage(data) {
  return request({
    url: '/fin/cmsMain/listPage',
    method: 'post',
    data
  })
}
// 提成详情
export function info(data) {
  return request({
    url: '/fin/cmsMain/info',
    method: 'post',
    data
  })
}
// 提成订单明细列表
export function listCmsOrderDetail(data) {
  return request({
    url: '/fin/cmsMain/listCmsOrderDetail',
    method: 'post',
    data
  })
}
// 提成利润分摊列表
export function listProfitAllot(data) {
  return request({
    url: '/fin/cmsMain/listProfitAllot',
    method: 'post',
    data
  })
}
// 提成发放明细列表
export function listCmsApplyPay(data) {
  return request({
    url: '/fin/cmsMain/listCmsApplyPay',
    method: 'post',
    data
  })
}
// 转到提成申请页面
export function toCmsApply(data) {
  return request({
    url: '/fin/cmsMain/toCmsApply',
    method: 'post',
    data
  })
}
// 提成申请保存
export function cmsApply(data) {
  return request({
    url: '/fin/cmsMain/cmsApply',
    method: 'post',
    data
  })
}
// 更新提成
export function redoCmsStat(data) {
  return request({
    url: '/fin/cmsMain/redoCmsStat',
    method: 'post',
    data
  })
}