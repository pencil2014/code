import request from '@/utils/request'

//应收-收款登记列表
export function regListPage(data) {
  return request({
    url: '/fin/receivableReg/listPage',
    method: 'post',
    data
  })
}
export function regInfo(data) {
  return request({
    url: '/fin/receivableReg/info',
    method: 'post',
    data
  })
}
export function regToUpdate(data) {
  return request({
    url: '/fin/receivableReg/toUpdate',
    method: 'post',
    data
  })
}
export function regAdd(data) {
  return request({
    url: '/fin/receivableReg/add',
    method: 'post',
    data
  })
}
export function regUpdate(data) {
  return request({
    url: '/fin/receivableReg/update',
    method: 'post',
    data
  })
}
export function regListInvoiceReceivable(data) {
  return request({
    url: '/fin/receivableReg/listInvoiceReceivable',
    method: 'post',
    data
  })
}
export function regRelateInvoiceReceivable(data) {
  return request({
    url: '/fin/receivableReg/relateInvoiceReceivable',
    method: 'post',
    data
  })
}
export function regTransfer(data) {
  return request({
    url: '/fin/receivableReg/transfer',
    method: 'post',
    data
  })
}
export function regConfirm(data) {
  return request({
    url: '/fin/receivableReg/confirm',
    method: 'post',
    data
  })
}
export function regDelete(data) {
  return request({
    url: '/fin/receivableReg/delete',
    method: 'post',
    data
  })
}
export function getRegListAmtSummary(data) {
  return request({
    url: '/fin/receivableReg/getListAmtSummary',
    method: 'post',
    data
  })
}
//撤销确认
export function cancelConfirm(data) {
  return request({
    url: '/fin/receivableReg/cancelConfirm',
    method: 'post',
    data
  })
}
//删除水单
export function regDeleteBankseqFile(data) {
  return request({
    url: '/fin/receivableReg/deleteBankseqFile',
    method: 'post',
    data
  })
}
//删除委托
export function regDeleteProxyFile(data) {
  return request({
    url: '/fin/receivableReg/deleteProxyFile',
    method: 'post',
    data
  })
}

//应收-收款登记转移列表
export function regTransferListPage(data) {
  return request({
    url: '/fin/receivableRegTransfer/listPage',
    method: 'post',
    data
  })
}
export function regTransferConfirm(data) {
  return request({
    url: '/fin/receivableRegTransfer/confirm',
    method: 'post',
    data
  })
}
export function regTransferRefund(data) {
  return request({
    url: '/fin/receivableReg/refund',
    method: 'post',
    data
  })
}
export function regTransferUploadBankseqFile(data) {
  return request({
    url: '/fin/receivableReg/uploadBankseqFile',
    method: 'post',
    data
  })
}
export function regTransferUploadProxyFile(data) {
  return request({
    url: '/fin/receivableReg/uploadProxyFile',
    method: 'post',
    data
  })
}

//应收-收款退款申请单
export function payApplyReceiveRefundList(data) {
  return request({
    url: '/fin/payApplyReceiveRefund/listPage',
    method: 'post',
    data
  })
}
export function getPayListAmtSummary(data) {
  return request({
    url: '/fin/payApplyReceiveRefund/getListAmtSummary',
    method: 'post',
    data
  })
}
export function payApplyReceiveRefundListPage(data) {
  return request({
    url: '/fin/payApplyReceiveRefund/listPage',
    method: 'post',
    data
  })
}
export function payApplyReceiveRefundInfo(data) {
  return request({
    url: '/fin/payApplyReceiveRefund/info',
    method: 'post',
    data
  })
}
export function payApplyReceiveRefundConfirm(data) {
  return request({
    url: '/fin/payApplyReceiveRefund/confirm',
    method: 'post',
    data
  })
}
export function payApplyReceiveRefundCancel(data) {
  return request({
    url: '/fin/payApplyReceiveRefund/cancel',
    method: 'post',
    data
  })
}
export function payApplyReceiveRefundQueryPrintInfo(data) {
  return request({
    url: '/fin/payApplyReceiveRefund/queryPrintInfo',
    method: 'post',
    data
  })
}
export function payApplyReceiveRefundPrintConfirm(data) {
  return request({
    url: '/fin/payApplyReceiveRefund/printConfirm',
    method: 'post',
    data
  })
}

export function writeoff(data) {
  return request({
    url: '/fin/receivableReg/writeoff',
    method: 'post',
    data
  })
}
export function listInvoiceReceivable(data) {
  return request({
    url: '/fin/receivableReg/listInvoiceReceivable',
    method: 'post',
    data
  })
}
export function relateInvoiceReceivable(data) {
  return request({
    url: '/fin/receivableReg/relateInvoiceReceivable',
    method: 'post',
    data
  })
}
export function addTransferFee(data) {
  return request({
    url: '/fin/receivableReg/addTransferFee',
    method: 'post',
    data
  })
}
export function deleteTransferFee(data) {
  return request({
    url: '/fin/receivableReg/deleteTransferFee',
    method: 'post',
    data
  })
}
// 预收抵账
export function receivablePrerevList(data) {
  return request({
    url: '/fin/receivablePrerev/listPage',
    method: 'post',
    data
  })
}
export function getPrerevListAmtSummary(data) {
  return request({
    url: '/fin/receivablePrerev/getListAmtSummary',
    method: 'post',
    data
  })
}
export function receivablePrerevInfo(data) {
  return request({
    url: '/fin/receivablePrerev/info',
    method: 'post',
    data
  })
}
export function receivablePrerevRefund(data) {
  return request({
    url: '/fin/receivablePrerev/refund',
    method: 'post',
    data
  })
}
export function receivablePrerevToWriteoff(data) {
  return request({
    url: '/fin/receivablePrerev/toWriteoff',
    method: 'post',
    data
  })
}
export function receivablePrerevWriteoff(data) {
  return request({
    url: '/fin/receivablePrerev/writeoff',
    method: 'post',
    data
  })
}
export function receivablePrerevTransfer(data) {
  return request({
    url: '/fin/receivablePrerev/transfer',
    method: 'post',
    data
  })
}
export function toPrerev(data) {
  return request({
    url: '/fin/receivableReg/toPrerev',
    method: 'post',
    data
  })
}

//财务日志
export function operateLog(data) {
  return request({
    url: '/fin/operateLog/listPage',
    method: 'post',
    data
  })
}



// 获取结算单核销费用列表
export function getWriteoffFeeList(data) {
  return request({
    url: '/fin/writeoffRecv/getWriteoffFeeList',
    method: 'post',
    data
  })
}


// 可核销结算单费用列表
export function settleOrderFeeList(data) {
  return request({
    url: '/fin/writeoffRecv/settleOrderFeeList',
    method: 'post',
    data
  })
}

// 可核销结算单列表
export function settleOrderList(data) {
  return request({
    url: '/fin/writeoffRecv/settleOrderList',
    method: 'post',
    data
  })
}

// 关联委托结算单位列表
export function getRefSettleUnitList(data) {
  return request({
    url: '/fin/writeoffRecv/getRefSettleUnitList',
    method: 'post',
    data
  })
}

// 费用列表-收款登记
export function toQuickRecvWriteoff(data) {
  return request({
    url: '/fin/fee/toQuickRecvWriteoff',
    method: 'post',
    data
  })
}
// 费用列表-收款登记核销
export function quickRecvWriteoff(data) {
  return request({
    url: '/fin/fee/quickRecvWriteoff',
    method: 'post',
    data
  })
}
// 收款登记修改结算单位
export function updateSettleUnit(data) {
  return request({
    url: '/fin/receivableReg/updateSettleUnit',
    method: 'post',
    data
  })
}
// 结算单快速收款登记核销
export function settleOrderWriteoff(data) {
  return request({
    url: '/fin/settleOrder/quickRecvWriteoff',
    method: 'post',
    data
  })
}
// 预收转移结算结算单位
export function transferSettleCorp(data) {
  return request({
    url: '/fin/receivablePrerev/transfer',
    method: 'post',
    data
  })
}
// 获取花旗定价手续费
export function getFixedTranferFeeList(data) {
  return request({
    url: '/fin/receivableReg/getFixedTranferFeeList',
    method: 'post',
    data
  })
}
// 指定协助代收付分公司
export function markAssistedComp(data) {
  return request({
    url: '/fin/receivableReg/markAssistedComp',
    method: 'post',
    data
  })
}

