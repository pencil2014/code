import request from '@/utils/request'

// 分页查询费用模板
export function queryFeeTemplatePageList(data) {
  return request({
    url: '/fin/feeTemp/queryFeeTemplatePageList',
    method: 'post',
    data
  })
}
// 查询费用模板详情
export function queryFeeTemplateDetail(data) {
  return request({
    url: '/fin/feeTemp/queryFeeTemplateDetail',
    method: 'post',
    data
  })
}
// 新增费用模板
export function addFeeTemplate(data) {
  return request({
    url: '/fin/feeTemp/addFeeTemplate',
    method: 'post',
    data
  })
}
// 修改费用模板
export function modifyFeeTemplate(data) {
  return request({
    url: '/fin/feeTemp/modifyFeeTemplate',
    method: 'post',
    data
  })
}
// 删除费用模板
export function deleteTemplate(data) {
  return request({
    url: '/fin/feeTemp/deleteTemplate',
    method: 'post',
    data
  })
}
// 费用模板启用/禁用
export function modifyEnabled(data) {
  return request({
    url: '/fin/feeTemp/modifyEnabled',
    method: 'post',
    data
  })
}
// 可用费用模板列表
export function usableFeeTemplate(data) {
  return request({
    url: '/fin/feeTemp/usableFeeTemplate',
    method: 'post',
    data
  })
}
// 获取费用模板明细项
export function getTemplateItem(data) {
  return request({
    url: '/fin/feeTemp/getTemplateItem',
    method: 'post',
    data
  })
}
// 修改费用模板显示序号
export function modifySortNum(data) {
  return request({
    url: '/fin/feeTemp/modifySortNum',
    method: 'post',
    data
  })
}