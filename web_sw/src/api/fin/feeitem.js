import request from '@/utils/request'

export function queryFeeItemList(data) {
  Object.assign(data, {
    size: data.size || 20
  })
  return request({
    url: '/fin/feeitem/feeItemList',
    method: 'post',
    data
  })
}
export function feeItemService(data) {
  return request({
    url: '/fin/feeitem/feeItemService',
    method: 'post',
    data
  })
}
export function queryFeeCode(data) {
  Object.assign(data, {
    size: 20
  })
  return request({
    url: '/fin/feeitem/feeItemList',
    method: 'post',
    data
  })
}
export function querySpecialFeeItemList(data) {
  return request({
    url: '/fin/feeitem/specialList',
    method: 'post',
    data
  })
}
//费用类别列表   凭证设置-费用管理 基础数据-费用项-费用类别
export function feeItemClassList(data) {
  return request({
    url: '/fin/feeitem/feeClassList',
    method: 'post',
    data
  })
}

//基础数据-海运基础信息-专项管理费用
// 费用项-列表
export function pageList(data) {
  return request({
    url: '/fin/feeitem/pageList',
    method: 'post',
    data
  })
}
// 费用项-修改
export function update(data) {
  return request({
    url: '/fin/feeitem/update',
    method: 'post',
    data
  })
}
// 费用项-费用项保存
export function save(data) {
  return request({
    url: '/fin/feeitem/save',
    method: 'post',
    data
  })
}
// 费用项-详情查询
export function feeItemInfo(data) {
  return request({
    url: '/fin/feeitem/feeItemInfo',
    method: 'post',
    data
  })
}
// 费用项-启用/禁用
export function updateEnabled(data) {
  return request({
    url: '/fin/feeitem/updateEnabled',
    method: 'post',
    data
  })
}

//基础数据-海运基础信息-专项管理费用
// 专项管理费用-列表
export function specialLimitRolePageList(data) {
  return request({
    url: '/fin/feeitem/specialLimitRolePageList',
    method: 'post',
    data
  })
}
// 专项管理费用-角色限制修改
export function updateSpecialLimitRole(data) {
  return request({
    url: '/fin/feeitem/updateSpecialLimitRole',
    method: 'post',
    data
  })
}
// 专项管理费用-角色限制删除
export function deleteSpecialLimitRole(data) {
  return request({
    url: '/fin/feeitem/deleteSpecialLimitRole',
    method: 'post',
    data
  })
}
// 专项管理费用-角色限制启用/禁用
export function updateSpecialLimitRoleEnabled(data) {
  return request({
    url: '/fin/feeitem/updateSpecialLimitRoleEnabled',
    method: 'post',
    data
  })
}
// 专项管理费用-角色限制新增
export function saveSpecialLimitRole(data) {
  return request({
    url: '/fin/feeitem/saveSpecialLimitRole',
    method: 'post',
    data
  })
}
// 通过费用分类查询费用项列表
// 添加、编辑税率 获取费用项列表 
export function feeItemListByGroup(data) {
  return request({
    url: '/fin/feeitem/feeItemListByGroup',
    method: 'post',
    data
  })
}
