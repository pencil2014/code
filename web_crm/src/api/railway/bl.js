import request from '@/utils/request'
//获取hbl打印数据
export function blHblPrint(data) {
	return request({
		url: '/order/shipping/bl/hbl/print',
		method: 'post',
		data
	})
}
//提单M单取单完成
export function railBlTakeFinish(data) {
	return request({
		url: '/order/rail/bl/take/finish',
		method: 'post',
		data
	})
}
//未导入的订单散货子单列表
export function getLclNoImportChildList(data) {
	return request({
		url: '/order/shiporder/lcl/noImport/child/list',
		method: 'post',
		data
	})
}
//散货提单创建时的箱封号从整柜单获取
export function getLclCnAndSn(data) {
	return request({
		url: '/order/shipping/bl/getLclCnAndSn',
		method: 'post',
		data
	})
}
//获取贸易单证类型
export function getDocTypeName(data) {
	return request({
		url: '/order/document/getDocTypeName',
		method: 'post',
		data
	})
}
//贸易单证申请放单
export function documentPut(data) {
	return request({
		url: '/order/document/put',
		method: 'post',
		data
	})
}
//贸易单证失效
export function documentInvalid(data) {
	return request({
		url: '/order/document/invalid',
		method: 'post',
		data
	})
}
// 提单预览
export function blFileReview(data) {
	return request({
		url: '/order/shipping/bl/file/review',
		method: 'post',
		data
	})
}
//导入子提单
export function blImportSubBl(data) {
	return request({
		url: '/order/shipping/bl/importSubBl',
		method: 'post',
		data
	})
}
//查询so更新日志
export function soLog(data) {
	return request({
		url: '/order/shiporder/spacebook/so/log',
		method: 'post',
		data
	})
}
//查询所有SO列表
export function blAllSoList(data) {
	return request({
		url: '/order/shipping/bl/bill/so/list',
		method: 'post',
		data
	})
}
//账单分页列表
export function blBillPageList(data) {
	return request({
		url: '/order/shipping/bl/bill/list',
		method: 'post',
		data
	})
}
//账单列表
export function blBillList(data) {
	return request({
		url: '/order/shipping/bl/bill/si/list',
		method: 'post',
		data
	})
}
//单号搜索建议
export function blNoList(data) {
	return request({
		url: '/order/shipping/bl/no/list',
		method: 'post',
		data
	})
}
//船东费用单上传接口
export function blBillUpload(data) {
	return request({
		url: '/order/shipping/bl/bill/upload',
		method: 'post',
		data
	})
}
//按单号查询提单信息
export function blBillInfo(data) {
	return request({
		url: '/order/shipping/bl/bill/info',
		method: 'post',
		data
	})
}
// 批量取单完成
export function blFinishBatch(data) {
	return request({
		url: '/order/take/finish/batch',
		method: 'post',
		data
	})
}
// 提单列表
export function blList(data) {
	return request({
		url: '/order/rail/bl/list',
		method: 'post',
		data
	})
}
export function blListBox(data) {
	return request({
		url: '/order/shipping/bl/listBox',
		method: 'post',
		data
	})
}
// 提单保存验证
export function blSaveCheck(data) {
	return request({
		url: '/order/shipping/bl/saveCheck',
		method: 'post',
		data
	})
}
// 提单新增
export function blSave(data) {
	return request({
		url: '/order/rail/bl/save',
		method: 'post',
		data
	})
}
// 提单删除
export function blDelete(data) {
	return request({
		url: '/order/rail/bl/delete',
		method: 'post',
		data
	})
}
// 提单状态修改
export function blUpdateStatus(data) {
	return request({
		url: '/order/shipping/bl/updateStatus',
		method: 'post',
		data
	})
}
// 详情
export function blDetail(data) {
	return request({
		url: '/order/rail/bl/detail',
		method: 'post',
		data
	})
}
// 铁路详情
export function blDetailRail(data) {
	return request({
		url: '/order/rail/bl/detail',
		method: 'post',
		data
	})
}
// 生成提单号
export function blCreateSerialNo(data) {
	return request({
		url: '/order/shipping/bl/createSerialNo',
		method: 'post',
		data
	})
}
// 提单拆分
export function blSeparate(data) {
	return request({
		url: '/order/rail/bl/separate',
		method: 'post',
		data
	})
}
// 提单并单
export function blMerge(data) {
	return request({
		url: '/order/rail/bl/merge',
		method: 'post',
		data
	})
}
// 提单生成提单
export function blCreateBlFromExist(data) {
	return request({
		url: '/order/shipping/bl/createBlFromExist',
		method: 'post',
		data
	})
}
// // 提单草单导出
// export function blDraftExport(data) {
//   return request({
//     url: '/order/shipping/bl/draft/export',
//     method: 'post',
//     data
//   })
// }
// 提单草单导出
export function blFileExport(data) {
	return request({
		url: '/order/shipping/bl/file/export',
		method: 'post',
		data
	})
}
// 提单草单确认
export function blDraftConfirm(data) {
	return request({
		url: '/order/rail/bl/draft/confirm',
		method: 'post',
		data
	})
}
// 提单撤回
export function blDeliveryCancel(data) {
	return request({
		url: '/order/rail/bl/release/cancel',
		method: 'post',
		data
	})
}
// 客户同意放货
export function blDeliveryApprove(data) {
	return request({
		url: '/order/rail/bl/release/agree',
		method: 'post',
		data
	})
}
// MBLCopy件确认
export function blCopyConfirm(data) {
	return request({
		url: '/order/shipping/bl/copy/confirm',
		method: 'post',
		data
	})
}
// 补料列表
export function blSiList(data) {
	return request({
		url: '/order/shipping/bl/si/list',
		method: 'post',
		data
	})
}
// 费用审核列表
export function blSiDnList(data) {
	return request({
		url: '/order/shipping/bl/si/dn/list',
		method: 'post',
		data
	})
}
// 补料详情
export function blSiInfo(data) {
	return request({
		url: '/order/shipping/bl/si/info',
		method: 'post',
		data
	})
}
// 费用审核补料详情
export function blSiDnInfo(data) {
	return request({
		url: '/order/shipping/bl/si/dn/info',
		method: 'post',
		data
	})
}
// 补料保存
export function blSiSave(data) {
	return request({
		url: '/order/shipping/bl/si/save',
		method: 'post',
		data
	})
}
// 船东费用商务审核通过
export function blSiDnPass(data) {
	return request({
		url: '/order/shipping/bl/si/dn/pass',
		method: 'post',
		data
	})
}
// 船东费用商务审核拒绝
export function blSiDnRefuse(data) {
	return request({
		url: '/order/shipping/bl/si/dn/refuse',
		method: 'post',
		data
	})
}
// M单取单客服变更
export function takeTcChange(data) {
	return request({
		url: '/order/take/tc/change',
		method: 'post',
		data
	})
}
// 放货参与人变更
export function putRcChange(data) {
	return request({
		url: '/order/put/rc/change',
		method: 'post',
		data
	})
}
// 提单附件列表
export function blFileList(data) {
	return request({
		url: '/order/blFile/list',
		method: 'post',
		data
	})
}
// 取放单附件列表
export function takePutFiles(data) {
	return request({
		url: '/order/blFile/takePutFiles',
		method: 'post',
		data
	})
}
// 提单附件删除
export function blFileDelete(data) {
	return request({
		url: '/order/blFile/delete',
		method: 'post',
		data
	})
}
// 放单附件撤回
export function putFileCancel(data) {
	return request({
		url: '/order/put/putFileCancel',
		method: 'post',
		data
	})
}
// 补料列表导出
export function blSiExport(data) {
	return request({
		url: '/order/shipping/bl/si/list/export',
		method: 'post',
		data
	})
}
// 费用审核列表导出
export function blSiDnExport(data) {
	return request({
		url: '/order/shipping/bl/si/dn/list/export',
		method: 'post',
		data
	})
}
// 取单列表
export function blTakeList(data) {
	return request({
		url: '/order/take/list',
		method: 'post',
		data
	})
}
// 取单详情
export function blTakeInfo(data) {
	return request({
		url: '/order/take/info',
		method: 'post',
		data
	})
}
// 取单保存
export function blTakeSave(data) {
	return request({
		url: '/order/take/save',
		method: 'post',
		data
	})
}
// 取单列表导出
export function blTakeExport(data) {
	return request({
		url: '/order/take/list/export',
		method: 'post',
		data
	})
}
// 取单完成
export function blTakeFinish(data) {
	return request({
		url: '/order/take/finish',
		method: 'post',
		data
	})
}
// 放单列表
export function blPutList(data) {
	return request({
		url: '/order/put/list',
		method: 'post',
		data
	})
}
// 放单详情
export function blPutInfo(data) {
	return request({
		url: '/order/put/info',
		method: 'post',
		data
	})
}
// 放单保存
export function blPutSave(data) {
	return request({
		url: '/order/put/save',
		method: 'post',
		data
	})
}
// 放单列表导出
export function blPutExport(data) {
	return request({
		url: '/order/put/list/export',
		method: 'post',
		data
	})
}
// 放单绩效表导出 /order/put/rcPerformanceReport/export
export function rcPerformanceExport(data) {
	return request({
		url: '/order/put/rcPerformanceReport/export',
		method: 'post',
		data
	})
}
// 放单发送邮件
export function blPutMail(data) {
	return request({
		url: '/order/put/mail',
		method: 'post',
		data
	})
}
// 批量放单完成
export function blPutFinish(data) {
	return request({
		url: '/order/put/finish',
		method: 'post',
		data
	})
}
// 财务放单审核列表
export function blFinList(data) {
	return request({
		url: '/order/fin/list',
		method: 'post',
		data
	})
}
// 业务发起放单给财务审核
export function blFinApply(data) {
	return request({
		url: '/order/fin/apply',
		method: 'post',
		data
	})
}
// 放单财务审核通过
export function blFinAuditPass(data) {
	return request({
		url: '/order/shipping/bl/fin/audit/pass',
		method: 'post',
		data
	})
}
// 放单财务审核处理中
export function blFinAuditProcessing(data) {
	return request({
		url: '/order/fin/audit/processing',
		method: 'post',
		data
	})
}
// 业务发起放单给财务审核导出
export function blFinExport(data) {
	return request({
		url: '/order/shipping/bl/fin/list/export',
		method: 'post',
		data
	})
}
// 批量审核通过
export function blFinAuditPassBatch(data) {
	return request({
		url: '/order/shipping/bl/fin/audit/pass/batch',
		method: 'post',
		data
	})
}
// 待押单订单列表
export function blPledgeOrderList(data) {
	return request({
		url: '/order/fin/pledge/list',
		method: 'post',
		data
	})
}
// 提单日志列表
export function blLogList(data) {
	return request({
		url: '/order/shipping/bl/log/list',
		method: 'post',
		data
	})
}
// 提单SO信息
export function blSoList(data) {
	return request({
		url: '/order/shipping/bl/so/list',
		method: 'post',
		data
	})
}
// 放单撤回
export function putCancel(data) {
	return request({
		url: '/order/put/cancel',
		method: 'post',
		data
	})
}

// 修改H单电放状态
export function updateInitTelexHblStatus(data) {
	return request({
		url: '/order/put/doc/finish',
		method: 'post',
		data
	})
}

// 查询关联的寄单信息 /order/shipping/express/expressRelation
export function getExpressRelation(data) {
	return request({
		url: '/order/shipping/express/expressRelation',
		method: 'post',
		data
	})
}
// 寄单关联保存 /order/shipping/express/saveRelation
export function saveRelation(data) {
	return request({
		url: '/order/shipping/express/saveRelation',
		method: 'post',
		data
	})
}
// 寄单订单文档信息 /order/shipping/express/getOrderListDocs
export function getOrderListDocs(data) {
	return request({
		url: '/order/shipping/express/getOrderListDocs',
		method: 'post',
		data
	})
}
// 取单完成批量
export function finishBatch(data) {
	return request({
		url: '/order/take/finishBatch',
		method: 'post',
		data
	})
}
// 取单完成单个
export function takeFinish(data) {
	return request({
		url: '/order/take/finish',
		method: 'post',
		data
	})
}