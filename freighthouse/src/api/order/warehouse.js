import request from '@/utils/request'
// 仓储进仓编码修改
export function inPositionUpdate(data) {
	return request({
		url: '/order/warehouseInplan/position/update',
		method: 'post',
		data
	})
}
// 仓储出仓编码修改
export function outPositionUpdate(data) {
	return request({
		url: '/order/warehouseOutplan/position/update',
		method: 'post',
		data
	})
}
// 仓库列表
export function warehouseDetail(data) {
	return request({
		url: '/order/warehouse/detail',
		method: 'post',
		data
	})
}
// 仓库列表
export function warehouseList(data) {
	return request({
		url: '/order/warehouse/list',
		method: 'post',
		data
	})
}
// 仓库列表
export function warehouseDelete(data) {
	return request({
		url: '/order/warehouse/delete',
		method: 'post',
		data
	})
}

// 仓库保存
export function warehouseSave(data) {
	return request({
		url: '/order/warehouse/save',
		method: 'post',
		data
	})
}
// 库存列表
export function warehouseStockList(data) {
	return request({
		url: '/order/warehouseStock/listPage',
		method: 'post',
		data
	})
}
// 仓库库存列表
export function listOrderStockByOrderNo(data) {
	return request({
		url: '/order/warehouseStock/listOrderStockByOrderNo',
		method: 'post',
		data
	})
}
// 目的港库存列表
export function listPodOrderCargoStock(data) {
	return request({
		url: '/order/warehouseStock/listPodOrderCargoStock',
		method: 'post',
		data
	})
}
// 起运港库存列表
export function listPolOrderCargoStock(data) {
	return request({
		url: '/order/warehouseStock/listPolOrderCargoStock',
		method: 'post',
		data
	})
}
// 仓库库存明细列表
export function listOrderCargoStockByOrderNo(data) {
	return request({
		url: '/order/warehouseStock/listOrderCargoStockByOrderNo',
		method: 'post',
		data
	})
}
// 库存弃货
export function warehouseStockJettison(data) {
	return request({
		url: '/order/warehouseStock/jettison',
		method: 'post',
		data
	})
}

// 库存操作日志
export function warehouseCargoLog(data) {
	return request({
		url: '/order/warehouseStock/log',
		method: 'post',
		data
	})
}

// 仓位图上传文件
export function uploadFile(data) {
	return request({
		url: '/order/warehouse/uploadFile',
		method: 'post',
		data
	})
}
// 仓库状态修改
export function updateStatus(data) {
	return request({
		url: '/order/warehouse/updateStatus',
		method: 'post',
		data
	})
}
