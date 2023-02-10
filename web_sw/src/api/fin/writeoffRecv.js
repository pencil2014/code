import request from '@/utils/request'

//应收收款核销
export function invoiceReceivableFeeList(data) {
  return request({
    url: '/fin/writeoffRecv/invoiceReceivableFeeList',
    method: 'post',
    data
  })
}
export function settleOrderList(data) {
  return request({
    url: '/fin/writeoffRecv/settleOrderList',
    method: 'post',
    data
  })
}
export function settleOrderFeeList(data) {
  return request({
    url: '/fin/writeoffRecv/settleOrderFeeList',
    method: 'post',
    data
  })
}
export function writeoff(data) {
  return request({
    url: '/fin/writeoffRecv/writeoff',
    method: 'post',
    data
  })
}
export function writeoffRecvListPage(data) {
  return request({
    url: '/fin/writeoffRecv/listPage',
    method: 'post',
    data
  })
}
export function writeoffRecvInfo(data) {
  return request({
    url: '/fin/writeoffRecv/info',
    method: 'post',
    data
  })
}
export function invoiceReceivableApply(data) {
  return request({
    url: '/fin/writeoffRecv/invoiceReceivableApply',
    method: 'post',
    data
  })
}
export function recheck(data) {
  return request({
    url: '/fin/writeoffRecv/recheck',
    method: 'post',
    data
  })
}
export function unlock(data) {
  return request({
    url: '/fin/writeoffRecv/unlock',
    method: 'post',
    data
  })
}
export function reverse(data) {
  return request({
    url: '/fin/writeoffRecv/reverse',
    method: 'post',
    data
  })
}
export function toReWriteoff(data) {
  return request({
    url: '/fin/writeoffRecv/toReWriteoff',
    method: 'post',
    data
  })
}
export function uploadBankseqFile(data) {
  return request({
    url: '/fin/receivableReg/uploadBankseqFile',
    method: 'post',
    data
  })
}
export function uploadProxyFile(data) {
  return request({
    url: '/fin/receivableReg/uploadProxyFile',
    method: 'post',
    data
  })
}
export function getListAmtSummary(data) {
  return request({
    url: '/fin/writeoffRecv/getListAmtSummary',
    method: 'post',
    data
  })
}


// 修改核销日期
export function updateWriteoffDate(data) {
  return request({
    url: '/fin/writeoffRecv/updateWriteoffDate',
    method: 'post',
    data
  })
}

// 修改大掌柜核销编号
export function updateWriteoffRecipayTransferDzg(data) {
  return request({
    url: '/fin/writeoffRecv/updateWriteoffRecipayTransferDzg',
    method: 'post',
    data
  })
}


// 手续费分摊明细
export function listTransferFeeAllot(data) {
  return request({
    url: '/fin/transferFee/listTransferFeeAllot',
    method: 'post',
    data
  })
}

// 会计凭证-收款核销列表
export function listAccountantPage(data) {
  return request({
    url: '/fin/writeoffRecv/listAccountantPage',
    method: 'post',
    data
  })
}
// 会计凭证-收款核销列表汇总
export function getAccountantListAmtSummary(data) {
  return request({
    url: '/fin/writeoffRecv/getAccountantListAmtSummary',
    method: 'post',
    data
  })
}

// 核销备注修改
export function updateRemark(data) {
  return request({
    url: '/fin/writeoffRecv/updateRemark',
    method: 'post',
    data
  })
}