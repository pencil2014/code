import request from '@/utils/request'
//获取后有柜的提单列表
export function blListBackContainer(data) {
	return request({
		url: '/order/shipping/bl/listBlBackContainer',
		method: 'post',
		data
	})
}
//委托单位信控信息
export function creditAndSettleInfo(data) {
	return request({
		url: '/order/fin/creditAndSettleInfo',
		method: 'post',
		data
	})
}
//工厂未同意提单列表
export function blFactoryDisagreeList(data) {
	return request({
		url: '/order/shipping/bl/factoryDisagree/list',
		method: 'post',
		data
	})
}
//工厂未同意提单申请
export function blFactoryDisagreeApply(data) {
	return request({
		url: '/order/shipping/bl/factoryDisagree/apply',
		method: 'post',
		data
	})
}
//工厂未同意提单申请取消
export function blFactoryDisagreeCancel(data) {
	return request({
		url: '/order/shipping/bl/factoryDisagree/cancel',
		method: 'post',
		data
	})
}
//工厂未同意提单审核
export function blFactoryDisagreeAudit(data) {
	return request({
		url: '/order/shipping/bl/factoryDisagree/audit',
		method: 'post',
		data
	})
}
//批量普通审批
export function auditBatch(data) {
	return request({
		url: '/order/fin/audit/batch',
		method: 'post',
		data
	})
}
//批量特殊审批
export function specialAuditBatch(data) {
	return request({
		url: '/order/fin/special/audit/batch',
		method: 'post',
		data
	})
}
//提单移动
export function blMove(data) {
	return request({
		url: '/order/shipping/bl/blMove',
		method: 'post',
		data
	})
}
//校验押柜订单
export function checkPledgeOrder(data) {
	return request({
		url: '/order/fin/checkPledgeOrder',
		method: 'post',
		data
	})
}
//校验大掌柜订单
export function checkDzgOrder(data) {
	return request({
		url: '/order/fin/checkDzgOrder',
		method: 'post',
		data
	})
}
//特殊审批参与人
export function workFlowActNodeList(data) {
	return request({
		url: '/order/workflow/act/node/list',
		method: 'post',
		data
	})
}
//特殊审批审核
export function blFinSpecialAudit(data) {
	return request({
		url: '/order/fin/special/audit',
		method: 'post',
		data
	})
}
//特殊审批申请
export function finSpecialCreate(data) {
	return request({
		url: '/order/fin/special/create',
		method: 'post',
		data
	})
}
//特殊审批审核
export function finSpecialAudit(data) {
	return request({
		url: '/order/fin/special/audit',
		method: 'post',
		data
	})
}
//获取放单申请原因
export function getFinApplyReason(data) {
	return request({
		url: '/order/fin/getFinApplyReason',
		method: 'post',
		data
	})
}
//批量获取放单申请原因
export function getFinApplyReasonBatch(data) {
	return request({
		url: '/order/fin/getFinApplyReason/batch',
		method: 'post',
		data
	})
}
//保存集装箱已核对接口
export function blContainerCheck(data) {
	return request({
		url: '/order/shipping/bl/container/check',
		method: 'post',
		data
	})
}
//进口提单放货完成
export function importBlPutFinish(data) {
	return request({
		url: '/order/shipping/import/bl/put/finish',
		method: 'post',
		data
	})
}
// 放单申请关联的结算单位
export function finSettList(data) {
	return request({
		url: '/order/fin/sett/list',
		method: 'post',
		data
	})
}
// 批量获取放单申请关联的结算单位
export function finSettListBatch(data) {
	return request({
		url: '/order/fin/sett/list/batch',
		method: 'post',
		data
	})
}
// 提单草单确认
export function blSiConfirm(data) {
	return request({
		url: '/order/shipping/bl/si/siConfirm',
		method: 'post',
		data
	})
}
//创建附件批次号
export function getFileBatchNo(data) {
	return request({
		url: '/order/file/fileBatchNo',
		method: 'post',
		data
	})
}
// 查询商务 shiporder/spacebook/getPricingInfo 
export function getPricingInfo(data) {
	return request({
		url: `order/shiporder/spacebook/getPricingInfo`,
		method: 'post',
		data
	})
}
//取主单Consignee
export function getMblConsignee(data) {
	return request({
		url: '/order/shipping/bl/getMblConsignee',
		method: 'post',
		data
	})
}
//获取补料要求
export function blDraftConfirmFileInfo(data) {
	return request({
		url: '/order/shipping/bl/draft/confirm/file/info',
		method: 'post',
		data
	})
}
//获取美国单号接口
export function blUsaCreate(data) {
	return request({
		url: '/order/shipping/bl/usa/create',
		method: 'post',
		data
	})
}
//批量生成美国单号
export function blUsaCreateBatch(data) {
	return request({
		url: '/order/shipping/bl/usa/create/batch',
		method: 'post',
		data
	})
}
//获取hbl打印数据
export function blHblPrint(data) {
	return request({
		url: '/order/shipping/bl/hbl/print',
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
//船东费用单删除
export function blBillDelete(data) {
	return request({
		url: '/order/shipping/bl/bill/delete',
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
// 提单列表(20220901新加)
export function blPageList(data) {
	return request({
		url: '/order/shipping/bl/page/list',
		method: 'post',
		data
	})
}
// 提单列表
export function blList(data) {
	return request({
		url: '/order/shipping/bl/list',
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
		url: '/order/shipping/bl/save',
		method: 'post',
		data
	})
}
// 提单删除
export function blDelete(data) {
	return request({
		url: '/order/shipping/bl/delete',
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
		url: '/order/shipping/bl/detail',
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
		url: '/order/shipping/bl/separate',
		method: 'post',
		data
	})
}
// 提单并单
export function blMerge(data) {
	return request({
		url: '/order/shipping/bl/merge',
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
// crm附件类型 crm/custGuarantee/detailForOrder
export function blDetailForOrder(data) {
	return request({
		url: '/crm/custGuarantee/detailForOrder',
		method: 'post',
		data
	})
}
export function relationGuarantees(data) {
	return request({
		url: '/order/blFile/relationGuarantees',
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
		url: '/order/shipping/bl/draft/confirm',
		method: 'post',
		data
	})
}
// 提单撤回
export function blDeliveryCancel(data) {
	return request({
		url: '/order/shipping/bl/release/cancel',
		method: 'post',
		data
	})
}
// 仅系统信息更新提单撤回 /order/shipping/bl/blSetCanEdit
export function blSetCanEdit(data) {
	return request({
		url: '/order/shipping/bl/blSetCanEdit',
		method: 'post',
		data
	})
}
// 新增提单工作号模糊搜索
export function blcreateList(data) {
	return request({
		url: '/order/shiporder/order/blcreate/list',
		method: 'post',
		data
	})
}
// 客户同意放货
export function blDeliveryApprove(data) {
	return request({
		url: '/order/shipping/bl/release/agree',
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
// 撤回取单申请
export function blTakeApplyCancel(data) {
	return request({
		url: '/order/shipping/bl/takeApply/cancel',
		method: 'post',
		data
	})
}
// 撤回推送文件确认
export function blCopyCancel(data) {
	return request({
		url: '/order/shipping/bl/copy/cancel',
		method: 'post',
		data
	})
}
// 商务审核船东账单信息
export function blBillPricingCheck(data) {
	return request({
		url: '/order/shipping/bl/bill/pricingCheck',
		method: 'post',
		data
	})
}
// 撤回商务审核船东账单
export function blBillCancelBill(data) {
	return request({
		url: '/order/shipping/bl/bill/cancelBill',
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
// 提单附件列表
export function blFileList(data) {
	return request({
		url: '/order/blFile/list',
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
// 提单附件失效
export function blFileInvalid(data) {
	return request({
		url: '/order/blFile/invalid',
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
// 校验是否允许放单
export function checkCanApplyPut(data) {
	return request({
		url: '/order/fin/checkCanApplyPut',
		method: 'post',
		data
	})
}
// 校验批量放单申请
export function checkCanBatchApply(data) {
	return request({
		url: '/order/fin/checkCanBatchApply',
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
		url: '/order/fin/audit/pass',
		method: 'post',
		data
	})
}
// 放单财务审核撤回
export function blFinAuditCancel(data) {
	return request({
		url: '/order/fin/audit/cancel',
		method: 'post',
		data
	})
}
// 放单申请撤回
export function blFinApplyCancel(data) {
	return request({
		url: '/order/fin/apply/cancel',
		method: 'post',
		data
	})
}
// 放单申请批量撤回
export function blFinApplyCancelBatch(data) {
	return request({
		url: '/order/fin/apply/cancel/batch',
		method: 'post',
		data
	})
}
// 放单财务审核拒绝
export function finAuditRefuse(data) {
	return request({
		url: '/order/fin/audit/refuse',
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
		url: '/order/fin/list/export',
		method: 'post',
		data
	})
}
// 批量审核通过
export function blFinAuditPassBatch(data) {
	return request({
		url: '/order/fin/audit/pass/batch',
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
// 海运SO信息
export function blSoList(data) {
	return request({
		url: '/order/shipping/bl/so/list',
		method: 'post',
		data
	})
}
// 铁路SO信息
export function railblSoList(data) {
	return request({
		url: '/order/rail/order/po/list',
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
// 获取收件地址
export function documentReceiveAddress(data) {
	return request({
		url: '/order/document/receiveAddress',
		method: 'post',
		data
	})
}
// 提单列表
export function blInfoList(data) {
	return request({
		url: '/order/shipping/bl/info/list',
		method: 'post',
		data
	})
}
// 提单列表导出
export function blInfoExport(data) {
	return request({
		url: '/order/shipping/bl/info/list/export',
		method: 'post',
		data
	})
}
// 客户同意出货
export function releaseAgree(data) {
	return request({
		url: '/order/shipping/bl/release/agree/batch',
		method: 'post',
		data
	})
}

// 转移提单
export function transferCreate(data) {
	return request({
		url: '/order/bl/transfer/create',
		method: 'post',
		data
	})
}
// 转移完成
export function transferComplete(data) {
	return request({
		url: '/order/bl/transfer/complete',
		method: 'post',
		data
	})
}
// 转移取消
export function transferCancel(data) {
	return request({
		url: '/order/bl/transfer/cancel',
		method: 'post',
		data
	})
}
// 转移列表
export function transferList(data) {
	return request({
		url: '/order/bl/transfer/list',
		method: 'post',
		data
	})
}
// 是否可以草单确认
export function confirmCheck(data) {
	return request({
		url: '/order/shipping/bl/draft/confirm/check',
		method: 'post',
		data
	})
}
// 订单地址模板列表 /crm/cust/address/list
export function getCustAddressList(data) {
	return request({
		url: '/crm/cust/address/list',
		method: 'post',
		data
	})
}

// 订单地址模板保存 /crm/cust/address/save
export function custAddressSave(data) {
	return request({
		url: '/crm/cust/address/save',
		method: 'post',
		data
	})
}

// 订单地址模板删除 /crm/cust/address/delete
export function custAddressDelete(data) {
	return request({
		url: '/crm/cust/address/delete',
		method: 'post',
		data
	})
}
// 提单信息列表
export function blAuditList(data) {
	return request({
		url: '/order/shipping/bl/audit/list',
		method: 'post',
		data
	})
}
// 提单信息列表导出
export function blAuditListExport(data) {
	return request({
		url: '/order/shipping/bl/audit/list/export',
		method: 'post',
		data
	})
}
// 批量提单检验接口
export function blDraftConfirmCheckBatch(data) {
	return request({
		url: '/order/shipping/bl/draft/confirm/check/batch',
		method: 'post',
		data
	})
}
// 批量草单确认
export function blDraftConfirmFileBatch(data) {
	return request({
		url: '/order/shipping/bl/draft/confirm/file/batch',
		method: 'post',
		data
	})
}
// 提单集装箱信息
export function getListBlCargoCust(data) {
	return request({
		url: '/order/shipping/bl/listBlCargoCust',
		method: 'post',
		data
	})
}
