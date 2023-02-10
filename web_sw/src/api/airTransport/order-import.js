import request from '@/utils/request'
// 货物保存
export function airCargoSave(data) {
  return request({
    url: '/order/air/imports/cargo/save',
    method: 'post',
    data
  })
}
// 货物列表
export function airCargoList(data) {
  return request({
    url: '/order/air/imports/cargo/list',
    method: 'post',
    data
  })
}
// 订单列表
export function orderList(data) {
  return request({
    url: '/order/air/imports/order/list',
    method: 'post',
    data
  })
}
// 订单列表导出
export function orderListExport(data) {
  return request({
    url: '/order/air/imports/order/list/export',
    method: 'post',
    data
  })
}
// 协同订单列表
export function orderJointList(data) {
  return request({
    url: '/order/air/imports/order/joint/list',
    method: 'post',
    data
  })
}
// 协同订单列表导出
export function orderJointListExport(data) {
  return request({
    url: '/order/air/imports/order/joint/list/export',
    method: 'post',
    data
  })
}
// 订单详情
export function orderInfo(data) {
  return request({
    url: '/order/air/imports/order/info',
    method: 'post',
    data
  })
}
// 订单复制
export function orderCopy(data) {
  return request({
    url: '/order/air/imports/order/copy',
    method: 'post',
    data
  })
}
// 订单取消 操作
export function orderCancelHandle(data) {
  return request({
    url: '/order/air/imports/order/cancel/handle',
    method: 'post',
    data
  })
}
// 订单取消申请 业务
export function orderCancelRequestImport(data) {
  return request({
    url: '/order/air/imports/order/cancel/request',
    method: 'post',
    data
  })
}
// BD/OBD 保存/提交订单
export function orderSave(data) {
  return request({
    url: '/order/air/imports/order/save',
    method: 'post',
    data
  })
}

// 提交审核后撤回订单
export function orderSubmitCancel(data) {
  return request({
    url: '/order/air/imports/order/submit/cancel',
    method: 'post',
    data
  })
}

// 审核列表查询-订舱列表
export function bookList(data) {
  return request({
    url: '/order/air/imports/audit/list',
    method: 'post',
    data
  })
}

// 审核列表导出
export function exportList(data) {
  return request({
    url: '/order/air/imports/audit/list/export',
    method: 'post',
    data
  })
}
// 入仓单上传
export function bookSoUpload(data) {
  return request({
    url: '/order/air/imports/book/file/upload',
    method: 'post',
    data
  })
}
// 入仓单删除
export function fileDelete(data) {
  return request({
    url: '/order/air/imports/book/file/delete',
    method: 'post',
    data
  })
}

// 客户自定BD/OBD 保存提交
export function selfSave(data) {
  return request({
    url: '/ororder/self/saveder/air/imports/',
    method: 'post',
    data
  })
}
//订舱详情
export function bookInfo(data) {
  return request({
    url: '/order/air/imports/book/info',
    method: 'post',
    data
  })
}

//订舱拒绝
export function bookRefuse(data) {
  return request({
    url: '/order/air/imports/audit/refuse',
    method: 'post',
    data
  })
}
//协助审核人撤回
export function spaceBookAuditCancel(data) {
  return request({
    url: '/order/air/imports/audit/joint/cancel',
    method: 'post',
    data
  })
}
//审核保存/通过
export function auditPass(data) {
  return request({
    url: '/order/air/imports/audit/pass',
    method: 'post',
    data
  })
}

// OP编辑订单
export function orderEdit(data) {
  return request({
    url: '/order/air/imports/order/edit',
    method: 'post',
    data
  })
}

// 客户自定OP编辑
export function orderSelfEdit(data) {
  return request({
    url: '/order/air/imports/order/self/edit',
    method: 'post',
    data
  })
}

// 订舱保存
export function bookSave(data) {
  return request({
    url: '/order/air/imports/book/save',
    method: 'post',
    data
  })
}
//订舱拒绝
export function bookRefuseOp(data) {
  return request({
    url: '/order/air/imports/book/refuse',
    method: 'post',
    data
  })
}

//货物出运
export function transportCheck(data) {
  return request({
    url: '/order/air/imports/book/transport/check',
    method: 'post',
    data
  })
}

// 托书导出
export function bookingExport(data) {
  return request({
    url: '/order/air/imports/book/booking/export',
    method: 'post',
    data
  })
}
// 放单列表
export function putList(data) {
  return request({
    url: '/order/put/list',
    method: 'post',
    data
  })
}
// 更新放货信息（申请放货）
export function blFinApply(data) {
  return request({
    url: '/order/air/imports/put/update',
    method: 'post',
    data
  })
}

// 放货财务审核列表
export function blFinList(data) {
  return request({
    url: '/order/air/imports/putFin/list',
    method: 'post',
    data
  })
}
// 批量审核通过
export function blFinAuditPassBatch(data) {
	return request({
		url: '/order/air/imports/putFin/pass',
		method: 'post',
		data
	})
}
// 审核-处理中
export function blFinAuditProcessing(data) {
	return request({
		url: '/order/air/imports/putFin/reviewing',
		method: 'post',
		data
	})
}

// 提单列表
export function blList(data) {
	return request({
		url: '/order/air/imports/bl/list',
		method: 'post',
		data
	})
}

// 删除提单
export function blDelete(data) {
	return request({
		url: '/order/air/imports/bl/delete',
		method: 'post',
		data
	})
}

// 草单确认
export function blDraftConfirm(data){
  return request({
		url: '/order/air/imports/bl/draftConfirm',
		method: 'post',
		data
	})
}
// 出单确认
export function blIssueBl(data){
  return request({
		url: '/order/air/imports/bl/issueBl',
		method: 'post',
		data
	})
}

// 提单详细
export function blDetail(data){
  return request({
		url: '/order/air/imports/bl/detail',
		method: 'post',
		data
	})
}

// 保存
export function blSave(data){
  return request({
		url: '/order/air/imports/bl/save',
		method: 'post',
		data
	})
}
// 生成提单号
export function blCreateSerialNo(data){
  return request({
		url: '/order/air/imports/bl/createSerialNo',
		method: 'post',
		data
	})
}
// 空运删除报关委托
export function airCustomsDel(data) {
	return request({
		url: '/order/air/imports/customs/del',
		method: 'post',
		data
	})
}

// 空运报关委托单导出
export function airCustomsExport(data) {
	return request({
		url: '/order/air/imports/customs/export',
		method: 'post',
		data
	})
}
// 空运报关更新委托状态
export function airCustomsUpdateStatus(data) {
	return request({
		url: '/order/air/imports/customs/updateStatus',
		method: 'post',
		data
	})
}
// 空运附件上传
export function airCustomsUpload(data) {
	return request({
		url: '/order/air/imports/customs/upload',
		method: 'post',
		data
	})
}
// 空运更新报关委托信息
export function airCustomsUpdate(data) {
	return request({
		url: '/order/air/imports/customs/update',
		method: 'post',
		data
	})
}
// 空运报关委托单附件列表
export function airCustomsListFile(data) {
	return request({
		url: '/order/air/imports/customs/listFile',
		method: 'post',
		data
	})
}
// 空运报关委托单货物列表
export function airCustomsListCargo(data) {
	return request({
		url: '/order/air/imports/customs/listCargo',
		method: 'post',
		data
	})
}
// 空运报关委托详情
export function airCustomsDetail(data) {
	return request({
		url: '/order/air/imports/customs/detail',
		method: 'post',
		data
	})
}
// 空运添加报关委托信息
export function airCustomsAdd(data) {
	return request({
		url: '/order/air/imports/customs/add',
		method: 'post',
		data
	})
}
// 空运报关委托单号获取
export function airCustomsGetIntrustNo(data) {
	return request({
		url: '/order/air/imports/customs/getIntrustNo',
		method: 'post',
		data
	})
}
// 空运报关委托列表
export function airCustomsList(data) {
	return request({
		url: '/order/air/imports/customs/list',
		method: 'post',
		data
	})
}
// 空运提单列表
export function airBlList(data) {
	return request({
		url: '/order/air/imports/bl/list',
		method: 'post',
		data
	})
}

// 放单申请列表导出
export function blApplyExport(data) {
	return request({
		url: '/order/air/imports/put/export',
		method: 'post',
		data
	})
}
// 放单审核列表导出
export function blFinExport(data) {
	return request({
		url: '/order/fin/list/export',
		method: 'post',
		data
	})
}

// 附件列表
export function fileList(data) {
	return request({
		url: '/order/air/imports/book/file/list',
		method: 'post',
		data
	})
}
// 放货详情
export function putDetail(data) {
	return request({
		url: '/order/fin/detail',
		method: 'post',
		data
	})
}
export function mainCustIntrustEdit(data) {
	return request({
		url: '/order/main/cust/intrust/edit',
		method: 'post',
		data
	})
}
// 航司详情信息
export function getCarrier(data) {
	return request({
		url: '/base/webapi/aircarrier/getCarrier',
		method: 'post',
		data
	})
}
// 托书上传批次
export function fileBatchNo(data) {
	return request({
		url: '/order/file/fileBatchNo',
		method: 'post',
		data
	})
}
// 托书删除
export function bookFileDelete(data) {
	return request({
		url: '/order/file/delete',
		method: 'post',
		data
	})
}
// 提单预览
export function blFileReview(data) {
	return request({
		url: '/order/air/imports/bl/reviewDraft',
		method: 'post',
		data
	})
}
// 提单打印
export function blHblPrint(data) {
	return request({
		url: '/order/air/imports/bl/printDraft',
		method: 'post',
		data
	})
}
// 校验用户可读权限
export function orderAuthCheck(data) {
	return request({
		url: '/order/auth/check',
		method: 'post',
		data
	})
}
// 提单撤回
export function airBlCancel(data) {
	return request({
		url: '/order/air/imports/bl/release/cancel',
		method: 'post',
		data
	})
}

// 输出舱单
export function exportManifest(data) {
	return request({
		url: '/order/air/imports/bl/exportManifest',
		method: 'post',
		data
	})
}
// 协助审单人撤回
export function auditJointCancel(data) {
	return request({
		url: '/order/air/imports/audit/joint/cancel',
		method: 'post',
		data
	})
}
// 获取进口部部门deptcode
export function getImportsDeptcode(data) {
	return request({
		url: '/order/main/imports/deptcode',
		method: 'post',
		data
	})
}