import request from '@/utils/request'
// 出库详情
export function outBoundQueryDetail(data) {
	return request({
		url: '/wms/outBound/queryDetail',
		method: 'post',
		data
	})
}
// 出库单货物列表
export function queryOutboundOrder(data) {
	return request({
		url: '/wms/customerInventory/queryOutboundOrder',
		method: 'post',
		data
	})
}
// 客户库存列表
export function customerInventoryQueryPageList(data) {
	return request({
		url: '/wms/customerInventory/queryPageList',
		method: 'post',
		data
	})
}
// 卸柜数详情
export function detailDiscarding(data) {
	return request({
		url: '/wms/summary/detailDiscarding',
		method: 'post',
		data
	})
}
// 装柜数详情
export function detailLoading(data) {
	return request({
		url: '/wms/summary/detailLoading',
		method: 'post',
		data
	})
}
// 仓库理货统计导出
export function exportTally(data) {
	return request({
		url: '/wms/summary/exportTally',
		method: 'post',
		data
	})
}
// 综合查询车辆统计导出
export function exportVehicle(data) {
	return request({
		url: '/wms/summary/exportVehicle',
		method: 'post',
		data
	})
}
// 仓库理货统计
export function summaryTally(data) {
	return request({
		url: '/wms/summary/summaryTally',
		method: 'post',
		data
	})
}
// 综合查询车辆统计
export function summaryVehicle(data) {
	return request({
		url: '/wms/summary/summaryVehicle',
		method: 'post',
		data
	})
}

// 出库单列表
export function outBoundQueryPageList(data) {
	return request({
		url: '/wms/outBound/queryPageList',
		method: 'post',
		data
	})
}
// 新增作业派工
export function workDispatchAdd(data) {
	return request({
		url: '/wms/workDispatch/add',
		method: 'post',
		data
	})
}
// 修改作业派工
export function workDispatchModify(data) {
	return request({
		url: '/wms/workDispatch/modify',
		method: 'post',
		data
	})
}
// 删除作业派工
export function workDispatchRemove(data) {
	return request({
		url: '/wms/workDispatch/remove',
		method: 'post',
		data
	})
}
// 作业派工详情
export function workDispatchDetail(data) {
	return request({
		url: '/wms/workDispatch/detail',
		method: 'post',
		data
	})
}
// 完成作业派工
export function workDispatchComplete(data) {
	return request({
		url: '/wms/workDispatch/complete',
		method: 'post',
		data
	})
}
// 作业派工列表
export function workDispatchQueryPage(data) {
	return request({
		url: '/wms/workDispatch/queryPage',
		method: 'post',
		data
	})
}
// 校验是否完工
export function checkWorkDispatch(data) {
	return request({
		url: '/wms/workDispatch/check',
		method: 'post',
		data
	})
}

// 供应商名称
export function supplierList(data) {
	return request({
		url: '/wms/base/supplierList',
		method: 'post',
		data
	})
}
// 客户名称
export function customerList(data) {
	return request({
		url: '/wms/base/customerList',
		method: 'post',
		data
	})
}
// 车队车辆启用
export function enableTruckTeam(data) {
	return request({
		url: '/wms/truck/enableTruckTeam',
		method: 'post',
		data
	})
}
// 车队车辆禁用
export function disableTruckTeam(data) {
	return request({
		url: '/wms/truck/disableTruckTeam',
		method: 'post',
		data
	})
}
// 车队车辆修改
export function updateTruckTeamInfo(data) {
	return request({
		url: '/wms/truck/updateTruckTeamInfo',
		method: 'post',
		data
	})
}
// 车队车辆详情
export function queryTruckDetail(data) {
	return request({
		url: '/wms/truck/queryTruckDetail',
		method: 'post',
		data
	})
}
// 车队车辆新增
export function saveTruckTeamInfo(data) {
	return request({
		url: '/wms/truck/saveTruckTeamInfo',
		method: 'post',
		data
	})
}
// 车队车辆列表
export function truckQueryPageList(data) {
	return request({
		url: '/wms/truck/queryPageList',
		method: 'post',
		data
	})
}
// 作业成员
export function employeeList(data) {
	return request({
		url: '/base/webapi/dept/employeeSelectlist',
		method: 'post',
		data
	})
}
// 作业分组详情
export function workTeamDetail(data) {
	return request({
		url: '/wms/workTeam/detail',
		method: 'post',
		data
	})
}
// 启用禁用作业分组
export function workTeamModifyEnabled(data) {
	return request({
		url: '/wms/workTeam/modifyEnabled',
		method: 'post',
		data
	})
}
// 删除作业分组
export function workTeamRemove(data) {
	return request({
		url: '/wms/workTeam/remove',
		method: 'post',
		data
	})
}
// 修改作业分组
export function workTeamModify(data) {
	return request({
		url: '/wms/workTeam/modify',
		method: 'post',
		data
	})
}
// 新增作业分组
export function workTeamAdd(data) {
	return request({
		url: '/wms/workTeam/add',
		method: 'post',
		data
	})
}
// 作业分组列表
export function workTeamQueryPage(data) {
	return request({
		url: '/wms/workTeam/queryPage',
		method: 'post',
		data
	})
}
// 仓库名称
export function warehouseList(data) {
	return request({
		url: '/wms/base/warehouseList',
		method: 'post',
		data
	})
}
// 费用名称
export function feeItemList(data) {
	return request({
		url: '/wms/base/feeItemList',
		method: 'post',
		data
	})
}
// 结算单位固定值
export function querySettleUnit(data) {
	return request({
		url: '/wms/base/querySettleUnit',
		method: 'post',
		data
	})
}
// 费用列表
export function feeTemplateQueryPage(data) {
	return request({
		url: '/wms/feeTemplate/queryPage',
		method: 'post',
		data
	})
}
// 费用详情
export function feeTemplateDetail(data) {
	return request({
		url: '/wms/feeTemplate/detail',
		method: 'post',
		data
	})
}
// 费用启用禁用
export function feeTemplateModifyEnabled(data) {
	return request({
		url: '/wms/feeTemplate/modifyEnabled',
		method: 'post',
		data
	})
}
// 费用修改
export function feeTemplateModify(data) {
	return request({
		url: '/wms/feeTemplate/modify',
		method: 'post',
		data
	})
}
// 费用新增
export function feeTemplateAdd(data) {
	return request({
		url: '/wms/feeTemplate/add',
		method: 'post',
		data
	})
}
// 码头堆场列表
export function yardQueryPage(data) {
	return request({
		url: '/wms/wharfYard/queryPage',
		method: 'post',
		data
	})
}
// 码头堆场修改
export function wharfYardModify(data) {
	return request({
		url: '/wms/wharfYard/modify',
		method: 'post',
		data
	})
}
// 码头堆场新增
export function wharfYardAdd(data) {
	return request({
		url: '/wms/wharfYard/add',
		method: 'post',
		data
	})
}

// 查询工作单号
export function queryOrder(data) {
  return request({
    url: '/wms/base/queryOrder',
    method: 'post',
    data
  })
}

// 获取仓库员工信息
export function warehouseEmployee(data) {
	return request({
		url: '/wms/warehouseEmployee/queryPage',
		method: 'post',
		data
	})
}

// 新增仓库员工
export function addWarehouseEmployee(data) {
	return request({
		url: '/wms/warehouseEmployee/add',
		method: 'post',
		data
	})
}

// 修改仓库员工
export function updateWarehouseEmployee(data) {
	return request({
		url: '/wms/warehouseEmployee/modify',
		method: 'post',
		data
	})
}

// 修改仓库员工
export function warehouseEmployeeDetail(data) {
	return request({
		url: '/wms/warehouseEmployee/detail',
		method: 'post',
		data
	})
}

// 查询当前登录用户所在仓库信息
export function queryWarehouseList (data) {
  return request({
    url: '/wms/warehouse/queryPageList',
    method: 'post',
    data
  })
}

// 查询当前登录用户所在仓库信息
export function queryWarehousePage (data) {
  return request({
    url: '/wms/warehouseEmployee/queryWarehousePage',
    method: 'post',
    data
  })
}