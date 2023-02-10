import request from '@/utils/request'
// 保险附件放单完成
export function insurancePutFinish(data) {
	return request({
		url: '/order/insurance/insurancePutFinish',
		method: 'post',
		data
	})
}
// 空运贸易单证删除
export function airDocumentDelete(data) {
	return request({
		url: '/order/document/delete',
		method: 'post',
		data
	})
}
// 空运贸易单证保存
export function airDocumentSave(data) {
	return request({
		url: '/order/document/save',
		method: 'post',
		data
	})
}
// 空运贸易单证列表
export function airDocumentList(data) {
	return request({
		url: '/order/document/list',
		method: 'post',
		data
	})
}
// 贸易单证失效
export function documentInvalid(data) {
	return request({
		url: '/order/document/invalidFile',
		method: 'post',
		data
	})
}
// 贸易单证申请放单
export function documentPut(data) {
	return request({
		url: '/order/document/put',
		method: 'post',
		data
	})
}
// 贸易单证列表
export function tradeDocList(data) {
	return request({
		url: '/order/document/list',
		method: 'post',
		data
	})
}
// 贸易单证更新
export function updateInvoiceNo(data) {
	return request({
		url: '/order/document/updateInvoiceNo',
		method: 'post',
		data
	})
}
// 贸易单证批量保存
export function documentSaveBatch(data) {
	return request({
		url: '/order/document/saveBatch',
		method: 'post',
		data
	})
}

// 贸易单证保存
export function tradeDocSave(data) {
	return request({
		url: '/order/document/save',
		method: 'post',
		data
	})
}
// 贸易单证保存(新)
export function tradeDocSaveNew(data) {
	return request({
		url: '/order/shipping/tradeDoc/save/new',
		method: 'post',
		data
	})
}

// 贸易单证删除
export function tradeDocDelete(data) {
	return request({
		url: '/order/document/delete',
		method: 'post',
		data
	})
}

// 贸易单证状态修改
export function tradeDocUpdateStatus(data) {
	return request({
		url: '/order/shipping/tradeDoc/updateStatus',
		method: 'post',
		data
	})
}

// 贸易单证数据
export function tradeDocDocDataDetail(data) {
	return request({
		url: '/order/document/docDataDetail',
		method: 'post',
		data
	})
}

// 贸易单证数据保存
export function tradeDocSaveDocData(data) {
	return request({
		url: '/order/document/saveDocData',
		method: 'post',
		data
	})
}

// 贸易单证附件上传
export function tradeDocUploadFile(data) {
	return request({
		url: '/order/shipping/tradeDoc/uploadFile',
		method: 'post',
		data
	})
}

// 保函列表
export function grtDocList(data) {
	return request({
		url: '/order/shipping/grtDoc/list',
		method: 'post',
		data
	})
}

// 保函保存
export function grtDocSave(data) {
	return request({
		url: '/order/shipping/grtDoc/save',
		method: 'post',
		data
	})
}

// 保函删除
export function grtDocDelete(data) {
	return request({
		url: '/order/shipping/grtDoc/delete',
		method: 'post',
		data
	})
}

// 保函状态修改
export function grtDocUpdateStatus(data) {
	return request({
		url: '/order/shipping/grtDoc/updateStatus',
		method: 'post',
		data
	})
}

// 保函数据
export function grtDocDocDataDetail(data) {
	return request({
		url: '/order/shipping/grtDoc/docDataDetail',
		method: 'post',
		data
	})
}

// 保函数据保存
export function grtDocSaveDocData(data) {
	return request({
		url: '/order/shipping/grtDoc/saveDocData',
		method: 'post',
		data
	})
}

// 保函附件上传
export function grtDocUploadFile(data) {
	return request({
		url: '/order/shipping/grtDoc/uploadFile',
		method: 'post',
		data
	})
}
