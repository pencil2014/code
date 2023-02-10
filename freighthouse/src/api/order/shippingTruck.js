import request from '@/utils/request'
// 空运删除提货委托信息
export function airTakeDel(data) {
	return request({
		url: '/order/air/take/del',
		method: 'post',
		data
	})
}
// 空运更新提货委托信息
export function airTakeUpdate(data) {
	return request({
		url: '/order/air/take/update',
		method: 'post',
		data
	})
}
// 空运提货委托详情
export function airTakeDetail(data) {
	return request({
		url: '/order/air/take/detail',
		method: 'post',
		data
	})
}
// 空运提货委托列表
export function airTakeList(data) {
	return request({
		url: '/order/air/take/list',
		method: 'post',
		data
	})
}
// 空运添加提货委托信息
export function airTakeAdd(data) {
	return request({
		url: '/order/air/take/add',
		method: 'post',
		data
	})
}
// 空运获取委托编号
export function airTakeGetIntrustNo(data) {
	return request({
		url: '/order/air/take/getIntrustNo',
		method: 'post',
		data
	})
}
// 空运更新委托状态
export function airTakeUpdateStatus(data) {
	return request({
		url: '/order/air/take/updateStatus',
		method: 'post',
		data
	})
}
/* 20210520新的拖柜api */
// 车队委托列表
export function fclTruckIntrustList(data) {
	return request({
		url: '/order/shipping/fclTruckIntrust/list',
		method: 'post',
		data
	})
}
// 车队委托新增
export function fclTruckIntrustSave(data) {
	return request({
		url: '/order/shipping/fclTruckIntrust/save',
		method: 'post',
		data
	})
}
// 车队委托删除
export function fclTruckIntrustDelete(data) {
	return request({
		url: '/order/shipping/fclTruckIntrust/delete',
		method: 'post',
		data
	})
}
// 车队委托状态修改
export function fclTruckIntrustUpdateIntrustStatus(data) {
	return request({
		url: '/order/shipping/fclTruckIntrust/updateIntrustStatus',
		method: 'post',
		data
	})
}
// 车队委托单号获取
export function fclTruckIntrustGetIntrustNo(data) {
	return request({
		url: '/order/shipping/fclTruckIntrust/getIntrustNo',
		method: 'post',
		data
	})
}
// 车队配载列表
export function fclTruckLoadList(data) {
	return request({
		url: '/order/shipping/fclTruckLoad/list',
		method: 'post',
		data
	})
}
// 车队配载保存
export function fclTruckLoadSave(data) {
	return request({
		url: '/order/shipping/fclTruckLoad/save',
		method: 'post',
		data
	})
}
// 车队配载删除
export function fclTruckLoadDelete(data) {
	return request({
		url: '/order/shipping/fclTruckLoad/delete',
		method: 'post',
		data
	})
}
// 装货信息的注意事项编辑
export function fclTruckIntrustUpdateBoxRemark(data) {
	return request({
		url: '/order/shipping/fclTruckIntrust/updateBoxRemark',
		method: 'post',
		data
	})
}
/* 拼箱散车收货 */
// 车队委托列表
export function scatterTruckIntrustList(data) {
	return request({
		url: '/order/shipping/scatterTruckIntrust/list',
		method: 'post',
		data
	})
}
// 车队委托删除
export function scatterTruckIntrustDelete(data) {
	return request({
		url: '/order/shipping/scatterTruckIntrust/delete',
		method: 'post',
		data
	})
}
// 车队委托状态修改
export function scatterTruckIntrustUpdateIntrustStatus(data) {
	return request({
		url: '/order/shipping/scatterTruckIntrust/updateIntrustStatus',
		method: 'post',
		data
	})
}
// 车队委托单号获取
export function scatterTruckIntrustGetWhBulkNo(data) {
	return request({
		url: '/order/shipping/scatterTruckIntrust/getWhBulkNo',
		method: 'post',
		data
	})
}
// 散车收货保存
export function scatterTruckIntrustSaveBulk(data) {
	return request({
		url: '/order/shipping/scatterTruckIntrust/saveBulk',
		method: 'post',
		data
	})
}
// 散车收货详情
export function scatterTruckIntrustBulkDetail(data) {
	return request({
		url: '/order/shipping/scatterTruckIntrust/bulkDetail',
		method: 'post',
		data
	})
}
// 车队配载列表
export function scatterTruckLoadList(data) {
	return request({
		url: '/order/shipping/scatterTruckLoad/list',
		method: 'post',
		data
	})
}
// 车队配载保存
export function scatterTruckLoadSave(data) {
	return request({
		url: '/order/shipping/scatterTruckLoad/save',
		method: 'post',
		data
	})
}
// 车队配载删除
export function scatterTruckLoadDelete(data) {
	return request({
		url: '/order/shipping/scatterTruckLoad/delete',
		method: 'post',
		data
	})
}
// 装货信息的注意事项编辑
export function scatterTruckIntrustUpdateBoxRemark(data) {
	return request({
		url: '/order/shipping/scatterTruckIntrust/updateBoxRemark',
		method: 'post',
		data
	})
}

/*废弃的拖柜api */
// 装货信息的注意事项编辑
export function updateBoxRemark(data) {
	return request({
		url: '/order/shipping/truckIntrust/updateBoxRemark',
		method: 'post',
		data
	})
}
// 车队委托列表
export function truckIntrustList(data) {
	return request({
		url: '/order/shipping/truckIntrust/list',
		method: 'post',
		data
	})
}

// 车队委托新增
export function truckIntrustSave(data) {
	return request({
		url: '/order/shipping/truckIntrust/save',
		method: 'post',
		data
	})
}

// 车队委托删除
export function truckIntrustDelete(data) {
	return request({
		url: '/order/shipping/truckIntrust/delete',
		method: 'post',
		data
	})
}

// 车队委托状态修改
export function truckIntrustUpdateIntrustStatus(data) {
	return request({
		url: '/order/shipping/truckIntrust/updateIntrustStatus',
		method: 'post',
		data
	})
}

// 车队派车状态修改
export function truckIntrustUpdateDispatchStatus(data) {
	return request({
		url: '/order/shipping/truckIntrust/updateDispatchStatus',
		method: 'post',
		data
	})
}

// 车队委托单号获取
export function truckIntrustGetIntrustNo(data) {
	return request({
		url: '/order/shipping/truckIntrust/getIntrustNo',
		method: 'post',
		data
	})
}

// 车队配载列表
export function truckLoadList(data) {
	return request({
		url: '/order/shipping/truckLoad/list',
		method: 'post',
		data
	})
}

// 车队配载新增
export function truckLoadSave(data) {
	return request({
		url: '/order/shipping/truckLoad/save',
		method: 'post',
		data
	})
}

// 车队配载删除
export function truckLoadDelete(data) {
	return request({
		url: '/order/shipping/truckLoad/delete',
		method: 'post',
		data
	})
}

// 散车收货保存
export function saveBulk(data) {
	return request({
		url: '/order/shipping/whTruckIntrust/saveBulk',
		method: 'post',
		data
	})
}

// 散车收货详情
export function bulkDetail(data) {
	return request({
		url: '/order/shipping/whTruckIntrust/bulkDetail',
		method: 'post',
		data
	})
}

// 散车收货列表
export function whTruckIntrustList(data) {
	return request({
		url: '/order/shipping/whTruckIntrust/list',
		method: 'post',
		data
	})
}
// 散车收货删除
export function whTruckIntrustDelete(data) {
	return request({
		url: '/order/shipping/whTruckIntrust/delete',
		method: 'post',
		data
	})
}
// 散车收货单号获取
export function whTruckIntrustGetIntrustNo(data) {
	return request({
		url: '/order/shipping/whTruckIntrust/getIntrustNo',
		method: 'post',
		data
	})
}
// 散车收货状态修改
export function whTruckIntrustUpdateIntrustStatus(data) {
	return request({
		url: '/order/shipping/whTruckIntrust/updateIntrustStatus',
		method: 'post',
		data
	})
}
// 获取散车拼箱委托编号
export function whTruckIntrustGetWhBulkNo(data) {
	return request({
		url: '/order/shipping/whTruckIntrust/getWhBulkNo',
		method: 'post',
		data
	})
}
// 拖柜查询预计拖柜时间 /order/shipping/fclTruckIntrust/getTruckDate
export function getTruckDate(data) {
	return request({
		url: '/order/shipping/fclTruckIntrust/getTruckDate',
		method: 'post',
		data
	})
}

// 拖柜保存预计拖柜时间 /order/shipping/fclTruckIntrust/saveTruckDate
export function saveTruckDate(data) {
	return request({
		url: '/order/shipping/fclTruckIntrust/saveTruckDate',
		method: 'post',
		data
	})
}
