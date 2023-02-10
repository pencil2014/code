import request from '@/utils/request'
// 占舱单查询详情
export function bookNewHoldInfo(data) {
	return request({
		url: '/order/shiporder/spacebook/new/hold/info',
		method: 'post',
		data
	})
}
// 按订单号查订舱单详情
export function bookOrderInfo(data) {
	return request({
		url: '/order/shiporder/spacebook/order/info',
		method: 'post',
		data
	})
}
// 邮件通知bkg op
export function spacebookTobkgandop(data) {
	return request({
		url: '/order/shiporder/spacebook/tobkgandop',
		method: 'post',
		data
	})
}
// 商务保柜
export function pricingDropDeal(data) {
	return request({
		url: '/order/shiporder/spacebook/pricing/drop/deal',
		method: 'post',
		data
	})
}
// pricing修改商务人员
export function bookAuditChange(data) {
	return request({
		url: '/order/shiporder/spacebook/audit/change',
		method: 'post',
		data
	})
}
// bkg修改订舱人员
export function bookBkgChange(data) {
	return request({
		url: '/order/shiporder/spacebook/bkg/change',
		method: 'post',
		data
	})
}
// 撤回放舱
export function bkgReleaseCancel(data) {
	return request({
		url: '/order/shiporder/spacebook/bkg/release/cancel',
		method: 'post',
		data
	})
}
// 附件列表
export function orderFileList(data) {
	return request({
		url: '/order/file/list',
		method: 'post',
		data
	})
}
// so列表查询
export function exportSoList(data) {
	return request({
		url: '/order/shiporder/spacebook/so/list/export',
		method: 'post',
		data
	})
}
// 按订舱单号查询SO甩柜信息
export function dropCompareList(data) {
	return request({
		url: `/order/shiporder/spacebook/so/drop/compare/list`,
		method: 'post',
		data
	})
}
// 保柜
export function dropHold(data) {
	return request({
		url: `/order/shiporder/spacebook/drop/hold`,
		method: 'post',
		data
	})
}
// 堆场装箱so选择
export function bookAllSo(data) {
	return request({
		url: '/order/shiporder/book/allSo',
		method: 'post',
		data
	})
}
// 根据订舱单号获取集装箱类型列表
export function getBookContainerTypeList(data) {
	return request({
		url: '/order/shiporder/spacebook/container/type/list',
		method: 'post',
		data
	})
}
// so列表
export function soList(data) {
	return request({
		url: `/order/shiporder/spacebook/so/soList`,
		method: 'post',
		data
	})
}
// so列表编辑
export function soUpdate(data) {
	return request({
		url: `/order/shiporder/spacebook/so/update`,
		method: 'post',
		data
	})
}
// 订舱申请单列表
export function bookList(data) {
	return request({
		url: '/order/shiporder/spacebook/list',
		method: 'post',
		data
	})
}
// 订舱申请单列表复制
export function orderCopy(data) {
	return request({
		url: '/order/shiporder/spacebook/copy',
		method: 'post',
		data
	})
}
// 订舱申请单列表
export function exportList(data) {
	return request({
		url: '/order/shiporder/spacebook/list/export',
		method: 'post',
		data
	})
}

// 订舱单详情
export function bookInfo(data) {
	return request({
		url: '/order/shiporder/spacebook/info',
		method: 'post',
		data
	})
}

// so列表查询
export function getSoList(data) {
	return request({
		url: '/order/shiporder/spacebook/so/list',
		method: 'post',
		data
	})
}

// 订单SO及箱型信息
export function getBookSoList(data) {
	return request({
		url: '/order/shiporder/book/so',
		method: 'post',
		data
	})
}

// 新增SO
export function addSO(data) {
	return request({
		url: '/order/shiporder/spacebook/so/upload',
		method: 'post',
		data
	})
}

// 绑定SO
export function bindSo(data) {
	return request({
		url: '/order/shiporder/spacebook/so/bind',
		method: 'post',
		data
	})
}

// 解绑so
export function unbindSo(data) {
	return request({
		url: '/order/shiporder/spacebook/so/unbind',
		method: 'post',
		data
	})
}

// 删除so
export function deleteSo(data) {
	return request({
		url: `/order/shiporder/spacebook/so/del`,
		method: 'post',
		data
	})
}

// SO标记取消
export function cancelSO(data) {
	return request({
		url: '/order/shiporder/spacebook/so/cancel',
		method: 'post',
		data
	})
}

// 撤销SO标记取消
export function cancelSoCancel(data) {
	return request({
		url: '/order/shiporder/spacebook/so/cancel/cancel',
		method: 'post',
		data
	})
}

// 审核保存及审核通过
export function bookSave(data) {
	return request({
		url: '/order/shiporder/spacebook/audit/pass',
		method: 'post',
		data
	})
}

// 改船申请审核通过
export function changePass(data) {
	return request({
		url: '/order/shiporder/spacebook/change/pass',
		method: 'post',
		data
	})
}

// 改船申请审核拒绝
export function changeRefuse(data) {
	return request({
		url: '/order/shiporder/spacebook/change/refuse',
		method: 'post',
		data
	})
}
// 改船bkg拒绝
export function changeBkgRefuse(data) {
	return request({
		url: '/order/shiporder/spacebook/change/bkg/refuse',
		method: 'post',
		data
	})
}

// BKG订舱处理
export function bkgProcess(data) {
	return request({
		url: '/order/shiporder/spacebook/bkg/process',
		method: 'post',
		data
	})
}

// BKG订舱拒绝
export function bkgRefuse(data) {
	return request({
		url: '/order/shiporder/spacebook/bkg/refuse',
		method: 'post',
		data
	})
}

// 订舱详情-审核拒绝
export function auditRefuse(data) {
	return request({
		url: '/order/shiporder/spacebook/audit/refuse',
		method: 'post',
		data
	})
}

// 申请占舱(创建申请单)
export function bookCreate(data) {
	return request({
		url: '/order/shiporder/spacebook/create',
		method: 'post',
		data
	})
}

// 协同审核人员撤回
export function cancelJoint(data) {
	return request({
		url: '/order/shiporder/spacebook/audit/joint/cancel',
		method: 'post',
		data
	})
}

// 订舱审核撤回
export function spaceBookAuditCancel(data) {
	return request({
		url: '/order/shiporder/spacebook/audit/cancel',
		method: 'post',
		data
	})
}
// 占舱申请单列表
export function bookzcList(data) {
	return request({
		url: '/order/shiporder/spacebook/list/zc',
		method: 'post',
		data
	})
}
// 托书导出
export function bookingExport(data) {
	return request({
		url: '/order/shiporder/book/booking/export',
		method: 'post',
		data
	})
}
// 占舱申请单列表导出
export function bookzcListExport(data) {
	return request({
		url: '/order/shiporder/spacebook/list/zc/export',
		method: 'post',
		data
	})
}