import request from '@/utils/request'
// 订单加柜
export function add(data) {
	return request({
		url: '/order/shiporder/book/container/add',
		method: 'post',
		data
	})
}
// 加柜删除
export function addDelete(data) {
	return request({
		url: '/order/shiporder/book/container/add/delete',
		method: 'post',
		data
	})
}
// 加柜提交撤回
export function addCancel(data) {
	return request({
		url: `/order/shiporder/book/container/add/cancel`,
		method: 'post',
		data
	})
}
// 加柜详情
export function addInfo(data) {
	return request({
		url: `/order/shiporder/book/container/add/info`,
		method: 'post',
		data
	})
}
// 加柜审核通过
export function addPass(data) {
	return request({
		url: `/order/shiporder/spacebook/container/add/pass`,
		method: 'post',
		data
	})
}
// 加柜审核拒绝
export function addRefuse(data) {
	return request({
		url: `/order/shiporder/spacebook/container/add/refuse`,
		method: 'post',
		data
	})
}
// 加柜申请BKG拒绝
export function addBkgRefuse(data) {
	return request({
		url: `/order/shiporder/spacebook/container/add/bkg/refuse`,
		method: 'post',
		data
	})
}