import request from '@/utils/request'

// 海运账单列表
export function listPage (data) {
	return request({
		url: '/fin/shBill/listPage',
		method: 'post',
		data
	})
}

// 海运账单详情
export function shBillInfo (data) {
	return request({
		url: '/fin/shBill/info',
		method: 'post',
		data
	})
}

// 海运账单新增修改
export function saveOrUpdate (data) {
	return request({
		url: '/fin/shBill/saveOrUpdate',
		method: 'post',
		data
	})
}

// 订单信息查询
export function orderInfo (data) {
	return request({
		url: '/fin/shBill/orderInfo',
		method: 'post',
		data
	})
}

// 账单发送商务确认
export function sendConfirm (data) {
	return request({
		url: '/fin/shBill/sendConfirm',
		method: 'post',
		data
	})
}

// 商务确认
export function shBillConfirm (data) {
	return request({
		url: '/fin/shBill/confirm',
		method: 'post',
		data
	})
}


// 商务取消确认
export function cancelConfirm(data) {
  return request({
    url: '/fin/shBill/cancelConfirm',
    method: 'post',
    data
  })
}

// 海运账单月度汇总分页列表
export function shLienMonListPage (data) {
	return request({
		url: '/fin/shLienMon/listPage',
		method: 'post',
		data
	})
}
// 航线月度汇总分页列表
export function listSysLinePage (data) {
	return request({
		url: '/fin/shLienMon/listSysLinePage',
		method: 'post',
		data
	})
}
export function getSysLineListAmtSummary (data) {
	return request({
		url: '/fin/shLienMon/getSysLineListAmtSummary',
		method: 'post',
		data
	})
}
// 商务月度汇总分页列表
export function listPricingPage (data) {
	return request({
		url: '/fin/shLienMon/listPricingPage',
		method: 'post',
		data
	})
}
export function getPricingListAmtSummary (data) {
	return request({
		url: '/fin/shLienMon/getPricingListAmtSummary',
		method: 'post',
		data
	})
}

// 月度汇总列表金额合计
export function shLienMonGetListAmtSummary (data) {
	return request({
		url: '/fin/shLienMon/getListAmtSummary',
		method: 'post',
		data
	})
}

// 添加专项管理费
export function toAddLienFee (data) {
	return request({
		url: '/fin/shBill/toAddLienFee',
		method: 'post',
		data
	})
}

// 专项管理费保存
export function saveShBillLienFee (data) {
	return request({
		url: '/fin/shBillLien/saveShBillLienFee',
		method: 'post',
		data
	})
}

// 月度账单详情
export function shLienMonInfo (data) {
	return request({
		url: '/fin/shLienMon/info',
		method: 'post',
		data
	})
}

// 留置费用亏损对冲
export function lossGedging (data) {
	return request({
		url: '/fin/gedging/lossGedging',
		method: 'post',
		data
	})
}


// 亏损对冲列表
export function gedgingListPage (data) {
	return request({
		url: '/fin/shLienGedging/listPage',
		method: 'post',
		data
	})
}
// 亏损对冲列表合计
export function getListAmtSummary(data) {
  return request({
    url: '/fin/shLienGedging/getListAmtSummary',
    method: 'post',
    data
  })
}

// 供应商留置费跳转付款申请
export function queryFeeForSettleApply (data) {
	return request({
		url: '/fin/shLienSettle/queryFeeForSettleApply',
		method: 'post',
		data
	})
}
// 付款申请合计
export function shLienSettleSettlePageAmtSummary (data) {
	return request({
		url: '/fin/shLienSettle/settlePageAmtSummary',
		method: 'post',
		data
	})
}

// 供应商留置费付款申请提交
export function saveShLienSettleApply (data) {
	return request({
		url: '/fin/shLienSettle/saveShLienSettleApply',
		method: 'post',
		data
	})
}

// 供应商留置费付款申请分页查询
export function shLienSettleListPage (data) {
	return request({
		url: '/fin/shLienSettle/listPage',
		method: 'post',
		data
	})
}


// 供应商留置费付款申请审核
export function shLienSettleAudit (data) {
	return request({
		url: '/fin/shLienSettle/shLienSettleAudit',
		method: 'post',
		data
	})
}
//商务费用结算审批日志
export function getAuditLog (data) {
	return request({
		url: '/fin/shLienSettle/getAuditLog',
		method: 'post',
		data
	})
}

// 亏损对冲详情
export function shLienGedgingInfo (data) {
	return request({
		url: '/fin/shLienGedging/info',
		method: 'post',
		data
	})
}

// 失效的账单附件列表
export function listInvalidBillFile (data) {
	return request({
		url: '/order/internal/fin/listInvalidBillFile',
		method: 'post',
		data
	})
}


// 失效的账单附件列表
export function feeListPage(data) {
  return request({
    url: '/fin/shLienMon/feeListPage',
    method: 'post',
    data
  })
}
// 失效的账单附件列表
export function feeListAmtSummary(data) {
  return request({
    url: '/fin/shLienMon/feeListAmtSummary',
    method: 'post',
    data
  })
}

//撤回申请
export function applyAuditCancel(data) {
  return request({
    url: '/fin/shLienSettle/applyAuditCancel',
    method: 'post',
    data
  })
}
export function listSysLineManagerSelect(data) {
  return request({
    url: '/base/webapi/systemLine/listSysLineManager4Select',
    method: 'post',
    data
  })
}
// 商务备注修改 /order/shipping/bl/bill/pricing/remark
export function updatePricingRemark(data) {
	return request({
		url: '/order/shipping/bl/bill/pricing/remark',
		method: 'post',
		data
	})
}
// 供应商留置费跳转付款申请
export function queryShLienSettleApplyInfo(data) {
  return request({
    url: '/fin/shLienSettle/queryShLienSettleApplyInfo',
    method: 'post',
    data
  })
}