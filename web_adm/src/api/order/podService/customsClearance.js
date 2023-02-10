import request from '@/utils/request'

// 委托清关列表
export function customsClearanceList(data) {
	return request({
		url: '/order/shipping/customsClearance/list',
		method: 'post',
		data
	})
}
// 空运委托清关列表
export function airCustomsClearanceList(data) {
	return request({
		url: '/order/air/imports/customsClearance/list',
		method: 'post',
		data
	})
}

// 获取委托清关编号
export function customsClearanceGetIntrustNo(data) {
	return request({
		url: '/order/shipping/customsClearance/getIntrustNo',
		method: 'post',
		data
	})
}
// 空运获取委托清关编号
export function airCustomsClearanceGetIntrustNo(data) {
	return request({
		url: '/order/air/imports/customsClearance/getIntrustNo',
		method: 'post',
		data
	})
}

// 新增委托清关
export function customsClearanceSave(data) {
	return request({
		url: '/order/shipping/customsClearance/save',
		method: 'post',
		data
	})
}
// 空运新增委托清关
export function airCustomsClearanceSave(data) {
	return request({
		url: '/order/air/imports/customsClearance/save',
		method: 'post',
		data
	})
}

// 委托清关状态修改
export function customsClearanceUpdateStatus(data) {
	return request({
		url: '/order/shipping/customsClearance/updateStatus',
		method: 'post',
		data
	})
}
// 空运委托清关状态修改
export function airCustomsClearanceUpdateStatus(data) {
	return request({
		url: '/order/air/imports/customsClearance/updateStatus',
		method: 'post',
		data
	})
}

// 委托清关删除
export function customsClearanceDelete(data) {
	return request({
		url: '/order/shipping/customsClearance/delete',
		method: 'post',
		data
	})
}
// 空运委托清关删除
export function airCustomsClearanceDelete(data) {
	return request({
		url: '/order/air/imports/customsClearance/delete',
		method: 'post',
		data
	})
}

// 委托清关详情
export function customsClearanceDetail(data) {
	return request({
		url: '/order/shipping/customsClearance/detail',
		method: 'post',
		data
	})
}
// 空运委托清关详情
export function airCustomsClearanceDetail(data) {
	return request({
		url: '/order/air/imports/customsClearance/detail',
		method: 'post',
		data
	})
}

// 委托清关附件列表
export function customsClearanceFileList(data) {
	return request({
		url: '/order/shipping/customsClearance/fileList',
		method: 'post',
		data
	})
}
// 空运委托清关附件列表
export function airCustomsClearanceFileList(data) {
	return request({
		url: '/order/air/imports/customsClearance/fileList',
		method: 'post',
		data
	})
}

// 委托清关删除附件
export function customsClearanceDeleteFile(data) {
	return request({
		url: '/order/shipping/customsClearance/deleteFile',
		method: 'post',
		data
	})
}
// 空运委托清关删除附件
export function airCustomsClearanceDeleteFile(data) {
	return request({
		url: '/order/air/imports/customsClearance/deleteFile',
		method: 'post',
		data
	})
}

// 委托清关打包下载附件
export function zipDownload(data) {
	return request({
		url: '/order/shipping/customsClearance/file/zipDownload',
		method: 'post',
		data
	})
}

// 委托清关选择附件
export function customsClearanceSelectFile(data) {
	return request({
		url: '/order/shipping/customsClearance/selectFile',
		method: 'post',
		data
	})
}
// 空运委托清关选择附件
export function airCustomsClearanceSelectFile(data) {
	return request({
		url: '/order/air/imports/customsClearance/selectFile',
		method: 'post',
		data
	})
}

// 委托清关附件类别列表
export function attachmentList(data) {
	return request({
		url: '/order/shipping/customsClearance/attachmentList',
		method: 'post',
		data
	})
}
// 空运委托清关附件类别列表
export function airAttachmentList(data) {
	return request({
		url: '/order/air/imports/customsClearance/attachmentList',
		method: 'post',
		data
	})
}
