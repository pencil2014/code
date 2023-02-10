import request from '@/utils/request'

// 获取仓库列表数据
export function queryPageList (data) {
  return request({
    url: '/wms/warehouse/queryPageList',
    method: 'post',
    data
  })
}

// 新增仓库
export function saveWarehouseInfo (data) {
  return request({
    url: '/wms/warehouse/saveWarehouseInfo',
    method: 'post',
    data
  })
}

// 修改仓库
export function updateWarehouseInfo (data) {
  return request({
    url: '/wms/warehouse/updateWarehouseInfo',
    method: 'post',
    data
  })
}

// 查看仓管列表
export function getEmployeeList (data) {
  return request({
		url: '/wms/base/employeeList',
		method: 'post',
		data
	})
}

// 耗材维护列表
export function getMaterialMaintList (data) {
  return request({
		url: '/wms/consumable/queryPageList',
		method: 'post',
		data
	})
}

// 新增耗材维护
export function saveConsumableInfo (data) {
  return request({
		url: '/wms/consumable/saveConsumableInfo',
		method: 'post',
		data
	})
}

// 修改耗材维护
export function updateConsumableInfo (data) {
  return request({
		url: '/wms/consumable/updateConsumableInfo',
		method: 'post',
		data
	})
}

// 启用耗材
export function enableConsumable (data) {
  return request({
		url: '/wms/consumable/enableConsumable',
		method: 'post',
		data
	})
}

// 禁用耗材
export function disableConsumable (data) {
  return request({
		url: '/wms/consumable/disableConsumable',
		method: 'post',
		data
	})
}

// 耗材库存列表
export function getMaterialstorageList (data) {
  return request({
		url: '/wms/consumableInventory/queryPageList',
		method: 'post',
		data
	})
}

// 耗材采购
export function savePurchase (data) {
  return request({
		url: '/wms/consumableInventory/purchase',
		method: 'post',
		data
	})
}

// 耗材报损
export function saveDamage (data) {
  return request({
		url: '/wms/consumableInventory/damage',
		method: 'post',
		data
	})
}

// 耗材库存预警值修改
export function updateInventoryAlert (data) {
  return request({
		url: '/wms/consumableInventory/updateInventoryAlert',
		method: 'post',
		data
	})
}

// 耗材购买记录
export function purchaseHistoryList (data) {
  return request({
		url: '/wms/consumableInventory/purchaseHistory',
		method: 'post',
		data
	})
}

// 耗材损坏记录
export function damageHistoryList (data) {
  return request({
		url: '/wms/consumableInventory/damageHistory',
		method: 'post',
		data
	})
}

// 获取仓管列表
export function queryTallyManList (data) {
  return request({
    url: '/wms/warehouse/queryTallyManList',
    method: 'post',
    data
  })
}

// 客户自带辅材查询
export function queryCustSelfList (data) {
  return request({
    url: '/wms/consumableInventory/custSelf/queryPageList',
    method: 'post',
    data
  })
}

// 客户自带辅材的库存历史记录
export function queryInventoryHistoryList (data) {
  return request({
    url: '/wms/consumableInventory/custSelf/inventoryHistory',
    method: 'post',
    data
  })
}