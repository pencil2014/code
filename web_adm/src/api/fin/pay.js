import request from '@/utils/request'

export function queryPrepayApplyPage(data) {
  return request({
    url: '/fin/pay/prepay/queryPrepayApplyPage',
    method: 'post',
    data
  })
}
export function savePrepayApply(data) {
  return request({
    url: '/fin/pay/prepay/savePrepayApply',
    method: 'post',
    data
  })
}
export function queryPrepayApplyInfo(data) {
  return request({
    url: '/fin/pay/prepay/queryPrepayApplyInfo',
    method: 'post',
    data
  })
}
export function approvePrepayApply(data) {
  return request({
    url: '/fin/pay/prepay/approvePrepayApply',
    method: 'post',
    data
  })
}
export function queryPrepayApplyPageSummary(data) {
  return request({
    url: '/fin/pay/prepay/queryPrepayApplyPageSummary',
    method: 'post',
    data
  })
}
export function prepayQueryPrintInfo(data) {
  return request({
    url: '/fin/pay/prepay/queryPrintInfo',
    method: 'post',
    data
  })
}
export function cancelPayApplyPrepay(data) {
  return request({
    url: '/fin/pay/prepay/cancelPayApplyPrepay',
    method: 'post',
    data
  })
}
export function prepayDedueInfoList(data) {
  return request({
    url: '/fin/pay/prepay/dedueInfoList',
    method: 'post',
    data
  })
}

//结算单付款申请列表
export function queryPayApplySettlePage(data) {
  return request({
    url: '/fin/pay/settle/queryPayApplySettlePage',
    method: 'post',
    data
  })
}
export function queryPayApplySettleInfo(data) {
  return request({
    url: '/fin/pay/settle/queryPayApplySettleInfo',
    method: 'post',
    data
  })
}
export function savePayApplySettle(data) {
  return request({
    url: '/fin/pay/settle/savePayApplySettle',
    method: 'post',
    data
  })
}
export function approvePayApplySettle(data) {
  return request({
    url: '/fin/pay/settle/approvePayApplySettle',
    method: 'post',
    data
  })
}
export function prepaymentPreView(data) {
  return request({
    url: '/fin/pay/settle/prepaymentPreView',
    method: 'post',
    data
  })
}
export function settleDelayInvoice(data) {
  return request({
    url: '/fin/pay/settle/delayInvoice',
    method: 'post',
    data
  })
}
export function queryPayApplySettlePageSummary(data) {
  return request({
    url: '/fin/pay/settle/queryPayApplySettlePageSummary',
    method: 'post',
    data
  })
}
export function generatePayOrder(data) {
  return request({
    url: '/fin/pay/settle/generatePayOrder',
    method: 'post',
    data
  })
}
export function mergePayApplySettle(data) {
  return request({
    url: '/fin/pay/settle/mergePayApplySettle',
    method: 'post',
    data
  })
}
export function splitPayApplySettle(data) {
  return request({
    url: '/fin/pay/settle/splitPayApplySettle',
    method: 'post',
    data
  })
}
export function relationInvoice(data) {
  return request({
    url: '/fin/pay/settle/relationInvoice',
    method: 'post',
    data
  })
}
export function downLoadInvoice(data) {
  return request({
    url: '/fin/pay/settle/downLoadInvoice',
    method: 'post',
    data
  })
}
export function settleQueryPrintInfo(data) {
  return request({
    url: '/fin/pay/settle/queryPrintInfo',
    method: 'post',
    data
  })
}
//撤回申请
export function cancelPayApplySettle(data) {
  return request({
    url: '/fin/pay/settle/cancelPayApplySettle',
    method: 'post',
    data
  })
}
// 撤回付款审核
export function settleWithdrawPayApplyAudit(data) {
  return request({
    url: '/fin/pay/settle/withdrawPayApplyAudit',
    method: 'post',
    data
  })
}
export function saveDzgInternalFee(data) {
  return request({
    url: '/fin/pay/settle/saveDzgInternalFee',
    method: 'post',
    data
  })
}
export function deleteDzgInternalFee(data) {
  return request({
    url: '/fin/pay/settle/deleteDzgInternalFee',
    method: 'post',
    data
  })
}

//打印次数
export function settlePrintConfirm(data) {
  return request({
    url: '/fin/pay/settle/printConfirm',
    method: 'post',
    data
  })
}
//添加备注
export function settleModifyFinRemark(data) {
  return request({
    url: '/fin/pay/settle/modifyFinRemark',
    method: 'post',
    data
  })
}
//撤回出纳
export function settleWithdrawApplyPayOrder(data) {
  return request({
    url: '/fin/pay/settle/withdrawApplyPayOrder',
    method: 'post',
    data
  })
}
// 结算申请-》批量通过-》查询批量审批需要的数据
export function queryBatchApproveData(data) {
  return request({
    url: '/fin/pay/settle/queryBatchApproveData',
    method: 'post',
    data
  })
}
// 结算申请-》批量通过-》批量审批通过结算付款申请
export function batchApproveData(data) {
  return request({
    url: '/fin/pay/settle/batchApproveData',
    method: 'post',
    data
  })
}
//结算财务标记已收
export function settleInvoiceReceive(data) {
  return request({
    url: '/fin/pay/settle/invoiceReceive',
    method: 'post',
    data
  })
}
//付款单列表分页查询
export function queryPayOrderPage(data) {
  return request({
    url: '/fin/pay/order/queryPayOrderPage',
    method: 'post',
    data
  })
}
export function queryPayOrderInfo(data) {
  return request({
    url: '/fin/pay/order/queryPayOrderInfo',
    method: 'post',
    data
  })
}
export function acceptancePayOrder(data) {
  return request({
    url: '/fin/pay/order/acceptancePayOrder',
    method: 'post',
    data
  })
}
export function payOrderInvoiceRelation(data) {
  return request({
    url: '/fin/pay/order/payOrderInvoiceRelation',
    method: 'post',
    data
  })
}
export function savePayOrderBankTransferInfo(data) {
  return request({
    url: '/fin/pay/order/savePayOrderBankTransferInfo',
    method: 'post',
    data
  })
}
export function markPayOrderWrong(data) {
  return request({
    url: '/fin/pay/order/markPayOrderWrong',
    method: 'post',
    data
  })
}
export function payOrderPrepayRefund(data) {
  return request({
    url: '/fin/pay/order/payOrderPrepayRefund',
    method: 'post',
    data
  })
}
export function payOrderWriteOffPreview(data) {
  return request({
    url: '/fin/pay/order/payOrderWriteOffPreview',
    method: 'post',
    data
  })
}
// export function queryPayApplySettle(data) {
//   return request({
//     url: '/fin/pay/order/queryPayApplySettle',
//     method: 'post',
//     data
//   })
// }
export function mergeMultiPayOrder(data) {
  return request({
    url: '/fin/pay/order/mergeMultiPayOrder',
    method: 'post',
    data
  })
}
export function queryPayOrderList(data) {
  return request({
    url: '/fin/pay/order/queryPayOrderList',
    method: 'post',
    data
  })
}

export function queryPayInfoInvoices(data) {
  return request({
    url: '/fin/pay/payInfo/queryPayInfoInvoices',
    method: 'post',
    data
  })
}
export function orderSplitPayOrder(data) {
  return request({
    url: '/fin/pay/order/splitPayOrder',
    method: 'post',
    data
  })
}
export function queryPayBankseqFileReceiInfo(data) {
  return request({
    url: '/fin/pay/order/queryPayBankseqFileReceiInfo',
    method: 'post',
    data
  })
}
export function sendPayBankseqFile(data) {
  return request({
    url: '/fin/pay/order/sendPayBankseqFile',
    method: 'post',
    data
  })
}
//修改付款单保存手续费信息
export function modifyPayOrderAndTransfer(data) {
  return request({
    url: '/fin/pay/order/modifyPayOrderAndTransfer',
    method: 'post',
    data
  })
}

//付款核销
export function saveWriteoffPayOrder(data) {
  return request({
    url: '/fin/writeoffPay/saveWriteoffPayOrder',
    method: 'post',
    data
  })
}
export function queryWriteoffPayPageList(data) {
  return request({
    url: '/fin/writeoffPay/queryWriteoffPayPageList',
    method: 'post',
    data
  })
}
export function queryPayWriteoff(data) {
  return request({
    url: '/fin/writeoffPay/queryPayWriteoff',
    method: 'post',
    data
  })
}
export function confirmPayWriteoff(data) {
  return request({
    url: '/fin/writeoffPay/confirmPayWriteoff',
    method: 'post',
    data
  })
}
export function writeoffUnlock(data) {
  return request({
    url: '/fin/writeoffPay/writeoffUnlock',
    method: 'post',
    data
  })
}
export function writeoffRollback(data) {
  return request({
    url: '/fin/writeoffPay/writeoffRollback',
    method: 'post',
    data
  })
}
export function afreshWriteoff(data) {
  return request({
    url: '/fin/writeoffPay/afreshWriteoff',
    method: 'post',
    data
  })
}
// export function queryPayApplyDetailFromSettle(data) {
//   return request({
//     url: '/fin/pay/settle/queryPayApplySettle',
//     method: 'post',
//     data
//   })
// }

//客商预付
export function prepayAccountListPage(data) {
  return request({
    url: '/fin/pay/prepay/prepayAccountListPage',
    method: 'post',
    data
  })
}
export function prepayPrintConfirm(data) {
  return request({
    url: '/fin/pay/prepay/printConfirm',
    method: 'post',
    data
  })
}
export function prepayAccountLogListPage(data) {
  return request({
    url: '/fin/pay/prepay/prepayAccountLogListPage',
    method: 'post',
    data
  })
}
export function prerevAccountListPage(data) {
  return request({
    url: '/fin/prerevAccount/listPage',
    method: 'post',
    data
  })
}
export function prerevAccountLogListPage(data) {
  return request({
    url: '/fin/prerevAccountLog/listPage',
    method: 'post',
    data
  })
}

// 付款单付错登记
export function saveErrorPayOrder(data) {
  return request({
    url: '/fin/pay/order/saveErrorPayOrder',
    method: 'post',
    data
  })
}

// 修改核销时间
export function updateWriteoffDate(data) {
  return request({
    url: '/fin/writeoffPay/updateWriteoffDate',
    method: 'post',
    data
  })
}

// 预付账号充值金额统计（预付账号充值记录列表表头汇总）
export function prepayAccountBalance(data) {
  return request({
    url: '/fin/prepayAccount/balance',
    method: 'post',
    data
  })
}
export function paymentPlatformBalance(data) {
  return request({
    url: '/fin/prepayAccount/paymentPlatformBalance',
    method: 'post',
    data
  })
}


// 查询预付款单的手续费分摊数据
export function queryPrepayOrderTransfer(data) {
  return request({
    url: '/fin/pay/order/queryPrepayOrderTransfer',
    method: 'post',
    data
  })
}

// 已经审批通过后需要关联发票时保存新关联的发票接口
export function payInfoRelationInvoice(data) {
  return request({
    url: '/fin/pay/payInfo/relationInvoice',
    method: 'post',
    data
  })
}

// 付款核销列表汇总接口
export function queryWriteoffPayPageSummary(data) {
  return request({
    url: '/fin/writeoffPay/queryWriteoffPayPageSummary',
    method: 'post',
    data
  })
}

// 提前验证结算单是否可以进行付款申请
export function validPayApplySettle(data) { 
  return request({
    url: '/fin/pay/settle/validPayApplySettle',
    method: 'post',
    data
  })
}

export function queryPayApplySettle(data) { // export function queryPayApplyInfoForSettle(data) {
  return request({
    url: '/fin/pay/settle/queryPayApplySettle',
    method: 'post',
    data
  })
}

// 可用的预付抵账
export function queryUsablePrepayDedueList(data) {
  return request({
    url: '/fin/pay/prepay/queryUsablePrepayDedueList',
    method: 'post',
    data
  })
}
// 可用的关联支付平台
export function usablePrepayDedueList(data) {
  return request({
    url: '/fin/pay/prepay/paymentchannel/usablePrepayDedueList',
    method: 'post',
    data
  })
}

// 付款单列表汇总接口
export function queryPayOrderPageSummary(data) {
  return request({
    url: '/fin/pay/order/queryPayOrderPageSummary',
    method: 'post',
    data
  })
}

// 付款单打印信息查询
export function queryPrintInfo(data) {
  return request({
    url: '/fin/pay/order/queryPrintInfo',
    method: 'post',
    data
  })
}
// 删除已关联的发票
export function deleteRelationInvoice(data) {
  return request({
    url: '/fin/pay/payInfo/deleteRelationInvoice',
    method: 'post',
    data
  })
}

// 付款单打印确认
export function printConfirm(data) {
  return request({
    url: '/fin/pay/order/printConfirm',
    method: 'post',
    data
  })
}

// 拒绝付款
export function refusePay(data) {
  return request({
    url: '/fin/pay/order/refusePay',
    method: 'post',
    data
  })
}

// 查询预付抵账使用的预付付款下可用的发票信息
export function queryUsablePrepayDedueInvoiceList(data) {
  return request({
    url: '/fin/pay/prepay/queryUsablePrepayDedueInvoiceList',
    method: 'post',
    data
  })
}

// 修改大掌柜费用核销单号
export function updateWriteoffReceipayTransferDzg(data) {
  return request({
    url: '/fin/writeoffPay/updateWriteoffReceipayTransferDzg',
    method: 'post',
    data
  })
}
export function acctWriteoffPayPageList(data) {
  return request({
    url: '/fin/writeoffPay/acctWriteoffPayPageList',
    method: 'post',
    data
  })
}
export function acctWriteoffPayPageSummary(data) {
  return request({
    url: '/fin/writeoffPay/acctWriteoffPayPageSummary',
    method: 'post',
    data
  })
}
// 通过手续费扣减承担方式获取应付手续费
export function payFixedTranferFeeBulid(data) {
  return request({
    url: '/fin/pay/order/payFixedTranferFeeBulid',
    method: 'post',
    data
  })
}
// 通过证件号码获取当月应使用的标识码
export function getIdNoThirdChannelCode(data) {
  return request({
    url: '/fin/pay/settle/getIdNoThirdChannelCode',
    method: 'post',
    data
  })
}
// 标记付款申请是否有提交纸质单据到出纳
export function presentedPaperBill(data) {
  return request({
    url: '/fin/pay/settle/presentedPaperBill',
    method: 'post',
    data
  })
}

// 标记交单/撤单
export function prePresentedPaperBill(data) {
  return request({
    url: '/fin/pay/prepay/presentedPaperBill',
    method: 'post',
    data
  })
}
