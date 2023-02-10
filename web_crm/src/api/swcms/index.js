import request from '@/utils/request'
//加价规则列表
export function priceRuleList(data) {
	return request({
		url: '/swmng/priceRule/listPage',
		method: 'post',
		data
	})
}
// 用户群组列表
export function groupList(data) {
	return request({
		url: '/swmng/group/dictList',
		method: 'post',
		data
	})
}
// 加价规则保存
export function priceRuleSave(data) {
	return request({
		url: '/swmng/priceRule/save',
		method: 'post',
		data
	})
}
// 加价规则失效
export function priceRuleInvalid(data) {
	return request({
		url: '/swmng/priceRule/invalid',
		method: 'post',
		data
	})
}
// 运价线路列表
export function webRouteList(data) {
	return request({
		url: '/swmng/webRoute/listPage',
		method: 'post',
		data
	})
}
// 批量失效
export function webRouteInvalid(data) {
	return request({
		url: '/swmng/webRoute/invalid',
		method: 'post',
		data
	})
}
// 批量生效
export function webRouteValid(data) {
	return request({
		url: '/swmng/webRoute/valid',
		method: 'post',
		data
	})
}
// 订单列表
export function orderList(data) {
	return request({
		url: '/swmng/ship/order/list',
		method: 'post',
		data
	})
}
// 修改订单
export function orderSave(data) {
	return request({
		url: '/swmng/ship/order/save',
		method: 'post',
		data
	})
}
// 订单详情
export function orderInfo(data) {
	return request({
		url: '/swmng/ship/order/info',
		method: 'post',
		data
	})
}
// 受理订单
export function orderAccept(data) {
	return request({
		url: '/swmng/ship/order/accept',
		method: 'post',
		data
	})
}
// 拒绝受理
export function orderRefuse(data) {
	return request({
		url: '/swmng/ship/order/refuse',
		method: 'post',
		data
	})
}
// 特价列表
export function discountList(data) {
	return request({
		url: '/swmng/discountRoute/listRoutePage',
		method: 'post',
		data
	})
}
// 批量失效
export function discountInvalid(data) {
	return request({
		url: '/swmng/discountRoute/invalid',
		method: 'post',
		data
	})
}
// 新增特价
export function saveDiscountRoute(data) {
	return request({
		url: '/swmng/discountRoute/saveDiscountRoute',
		method: 'post',
		data
	})
}
// 线路数据
export function listAddRoutePage(data) {
	return request({
		url: '/swmng/discountRoute/listAddRoutePage',
		method: 'post',
		data
	})
}
// 客户审核列表
export function customerList(data) {
	return request({
		url: '/swmng/corpSubmit/list',
		method: 'post',
		data
	})
}
// 天眼查企业信息
export function tycDetail(data) {
	return request({
		url: '/swmng/corpSubmit/tyc/detail',
		method: 'post',
		data
	})
}
// 客户审核通过
export function customerVerify(data) {
	return request({
		url: '/swmng/corpSubmit/verify/pass',
		method: 'post',
		data
	})
}
// 客户审核拒绝
export function customerRefuse(data) {
	return request({
		url: '/swmng/corpSubmit/verify/refuse',
		method: 'post',
		data
	})
}
// 客户审核详情
export function customerDetail(data) {
	return request({
		url: '/swmng/corpSubmit/detail',
		method: 'post',
		data
	})
}
// 客户信息编辑
export function corpSubmit(data) {
	return request({
		url: '/swmng/corpSubmit/edit',
		method: 'post',
		data
	})
}
// 附件列表
export function fileList(data) {
	return request({
		url: '/swmng/ship/order/file/list',
		method: 'post',
		data
	})
}
