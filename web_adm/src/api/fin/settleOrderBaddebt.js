// 其它核销-坏账核销
import request from '@/utils/request'

// 坏账核销列表
export function listPage (data) {
	return request({
		url: '/fin/settleOrderBaddebt/listPage',
		method: 'post',
		data
	})
}
// 核销复核
export function confirmWriteoff (data) {
	return request({
		url: '/fin/writeoffNopay/confirmWriteoff',
		method: 'post',
		data
	})
}
// 核销解锁
export function unlock (data) {
	return request({
		url: '/fin/writeoffNopay/unlock',
		method: 'post',
		data
	})
}
// 反核销
export function reverse (data) {
	return request({
		url: '/fin/writeoffNopay/reverse',
		method: 'post',
		data
	})
}
// TODO
// 生成凭证 接口未做
// export function listPage(data) {
//   return request({
//     url: '/fin/writeoffNopay/listPage',
//     method: 'post',
//     data
//   })
// }
// 坏账核销列表-申请发起详情
export function applyDetail (data) {
	return request({
		url: '/fin/settleOrderBaddebt/applyDetail',
		method: 'post',
		data
	})
}
// 坏账核销-申请详情
export function info (data) {
	return request({
		url: '/fin/settleOrderBaddebt/info',
		method: 'post',
		data
	})
}
// 坏账核销-提交申请
export function apply (data) {
	return request({
		url: '/fin/settleOrderBaddebt/apply',
		method: 'post',
		data
	})
}
// export function edit(data) {
//   return request({
//     url: '/fin/settleOrderBaddebt/edit',
//     method: 'post',
//     data
//   })
// }
// 坏账核销-坏账审批
export function audit (data) {
	return request({
		url: '/fin/settleOrderBaddebt/audit',
		method: 'post',
		data
	})
}


// 坏账预销单列表
export function baddebtPreOrderListPage (data) {
	return request({
		url: '/fin/settleOrderBaddebt/baddebtPreOrderListPage',
		method: 'post',
		data
	})
}

// 坏账批量审批
export function auditBatch (data) {
	return request({
		url: '/fin/settleOrderBaddebt/auditBatch',
		method: 'post',
		data
	})
}


// 坏账申请列表金额汇总
export function getListAmtSummary (data) {
	return request({
		url: '/fin/settleOrderBaddebt/getListAmtSummary',
		method: 'post',
		data
	})
}

// 坏账预销单列表汇总
export function preOrderListAmtSummary (data) {
	return request({
		url: '/fin/settleOrderBaddebt/preOrderListAmtSummary',
		method: 'post',
		data
	})
}

// 坏账预销单详情
export function preOrderInfo (data) {
	return request({
		url: '/fin/settleOrderBaddebt/preOrderInfo',
		method: 'post',
		data
	})
}

// 修改核销日期
export function updateWriteoffDate (data) {
	return request({
		url: '/fin/writeoffNopay/updateWriteoffDate',
		method: 'post',
		data
	})
}

// 坏账撤销申请
export function badApplyCancel(data) {
  return request({
    url: '/fin/settleOrderBaddebt/cancel',
    method: 'post',
    data
  })
}