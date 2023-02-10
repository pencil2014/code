import request from '@/utils/request'
// 现舱列表-商务
export function listStockByPricing (data) {
	return request({
		url: '/bkg/stock/listStockByPricing',
		method: 'post',
		data
	})
}

// 现舱列表-业务
export function listStockByBdOrOther (data) {
	return request({
		url: '/bkg/stock/listStockByBdOrOther',
		method: 'post',
		data
	})
}

// 现舱申请列表
export function listStockApply (data) {
	return request({
		url: '/bkg/apply/listStockApply',
		method: 'post',
		data
	})
}

// 现舱申领详情
export function applyDetail (data) {
	return request({
		url: '/bkg/apply/applyDetail',
		method: 'post',
		data
	})
}

// 现舱申领拒绝
export function refuse (data) {
	return request({
		url: '/bkg/apply/refuse',
		method: 'post',
		data
	})
}

// 现舱分配so列表
export function listStockSoByStockId (data) {
	return request({
		url: '/bkg/stock/so/listStockSoByStockId',
		method: 'post',
		data
	})
}

// 现舱分配
export function allocate (data) {
	return request({
		url: '/bkg/apply/allocate',
		method: 'post',
		data
	})
}

// 现舱修改
export function updateApplyCount (data) {
	return request({
		url: '/bkg/apply/updateApplyCount',
		method: 'post',
		data
	})
}

// 现舱申领撤回
export function deleteApply (data) {
	return request({
		url: '/bkg/apply/deleteApply',
		method: 'post',
		data
	})
}

// 现舱申请
export function applyAdd (data) {
	return request({
		url: '/bkg/apply/add',
		method: 'post',
		data
	})
}

// 退仓列表
export function listStockReturn (data) {
	return request({
		url: '/bkg/return/listStockReturn',
		method: 'post',
		data
	})
}

// 退仓审核列表
export function listStockReturnAudit (data) {
	return request({
		url: '/bkg/return/listStockReturnAudit',
		method: 'post',
		data
	})
}


// 现舱退舱确认
export function retreatConfirm (data) {
	return request({
		url: '/bkg/return/retreatConfirm',
		method: 'post',
		data
	})
}
// 退舱详情
export function returnDetail (data) {
	return request({
		url: '/bkg/return/returnDetail',
		method: 'post',
		data
	})
}
// 现舱退回列表信息
export function returnSo (data) {
	return request({
		url: '/bkg/return/so',
		method: 'post',
		data
	})
}

// 现舱退舱
export function retreat (data) {
	return request({
		url: '/bkg/return/retreat',
		method: 'post',
		data
	})
}
// 现舱退舱撤回--业务员操作
export function cancelReturn (data) {
	return request({
		url: '/bkg/return/cancelReturn',
		method: 'post',
		data
	})
}

// 消息列表
export function messageList (data) {
	return request({
		url: '/bkg/message/list',
		method: 'post',
		data
	})
}

// 消息发布
export function messageAdd (data) {
	return request({
		url: '/bkg/message/add',
		method: 'post',
		data
	})
}

// 消息下架
export function messageOff (data) {
	return request({
		url: '/bkg/message/off',
		method: 'post',
		data
	})
}


// 现舱售价修改
export function updateSellPrice (data) {
	return request({
		url: '/bkg/stock/updateSellPrice',
		method: 'post',
		data
	})
}


// 现舱新增导入
export function importStock (data) {
	return request({
		url: '/bkg/stock/importStock',
		method: 'post',
		data
	})
}


// 现舱新增
export function addStock (data) {
	return request({
		url: '/bkg/stock/addStock',
		method: 'post',
		data
	})
}


// 现舱so列表
export function listAllStockSoByStockId (data) {
	return request({
		url: '/bkg/stock/so/listAllStockSoByStockId',
		method: 'post',
		data
	})
}

// 现舱so备注修改
export function updateStockSoRemark (data) {
	return request({
		url: '/bkg/stock/updateStockSoRemark',
		method: 'post',
		data
	})
}

// 航线预报列表
export function forecastList (data) {
	return request({
		url: '/bkg/forecast/rule/list',
		method: 'post',
		data
	})
}

// 航线预报删除
export function forecastDelete (data) {
	return request({
		url: '/bkg/forecast/rule/delete',
		method: 'post',
		data
	})
}

// 航线预报保存
export function forecastAdd (data) {
	return request({
		url: '/bkg/forecast/rule/add',
		method: 'post',
		data
	})
}

// 消息通知列表
export function noticeList (data) {
	return request({
		url: '/bkg/bkg/notice/list',
		method: 'post',
		data
	})
}

// 航线维护人分页列表
export function listPageSel (data) {
	return request({
		url: '/bkg/sle/listPage',
		method: 'post',
		data
	})
}

// 消息通知标记已读
export function noticeRead (data) {
	return request({
		url: '/bkg/bkg/notice/read',
		method: 'post',
		data
	})
}

// 航线维护人更新
export function updateLine (data) {
	return request({
		url: '/bkg/sle/update',
		method: 'post',
		data
	})
}
// 航线维护人新增
export function addLine (data) {
	return request({
		url: '/bkg/sle/save',
		method: 'post',
		data
	})
}
// 航线分组列表
export function groupSystemLine (data) {
	return request({
		url: '/base/webapi/systemLine/groupSystemLine',
		method: 'post',
		data
	})
}
// 全部标记已读
export function noticeReadAll (data) {
	return request({
		url: '/bkg/bkg/notice/readAll',
		method: 'post',
		data
	})
}

// 删除航线维护人
export function deleteSle (data) {
	return request({
		url: '/bkg/sle/delete',
		method: 'post',
		data
	})
}

// 现舱删除
export function deleteStock (data) {
	return request({
		url: '/bkg/stock/delete',
		method: 'post',
		data
	})
}


// 查询消息未读数量
export function unreadCount (data) {
	return request({
		url: '/bkg/bkg/notice/unreadCount',
		method: 'post',
		data
	})
}


// 申请审核列表
export function listStockApplyAudit (data) {
	return request({
		url: '/bkg/apply/listStockApplyAudit',
		method: 'post',
		data
	})
}

// 现舱详情
export function detailStock (data) {
	return request({
		url: '/bkg/stock/detailStock',
		method: 'post',
		data
	})
}
