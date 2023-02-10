import request from '@/utils/request'

// 税率配置列表分页查询
export function taxRateConfigPageList(data) {
  return request({
    url: '/fin/tax/taxRateConfigPageList',
    method: 'post',
    data
  })
}
// 税率配置新增
export function saveTaxRateConfig(data) {
  return request({
    url: '/fin/tax/saveTaxRateConfig',
    method: 'post',
    data
  })
}
// 税率配置修改
export function updateTaxRateConfig(data) {
  return request({
    url: '/fin/tax/updateTaxRateConfig',
    method: 'post',
    data
  })
}
// 税率配置删除
export function deleteTaxRateConfig(data) {
  return request({
    url: '/fin/tax/deleteTaxRateConfig',
    method: 'post',
    data
  })
}
// 税率配置启用/停用
export function updateTaxRateConfigEnabled(data) {
  return request({
    url: '/fin/tax/updateTaxRateConfigEnabled',
    method: 'post',
    data
  })
}
// 税率配置详情
export function taxRateConfigInfo(data) {
  return request({
    url: '/fin/tax/taxRateConfigInfo',
    method: 'post',
    data
  })
}
// 税额计算
export function calculateTaxAmount(data) {
  return request({
    url: '/fin/tax/calculateTaxAmount',
    method: 'post',
    data
  })
}
// 查询费用项适用税率
export function getTaxRate(data) {
  return request({
    url: '/fin/tax/getTaxRate',
    method: 'post',
    data
  })
}