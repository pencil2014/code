import request from '@/utils/request'

//收付核销生成凭证
export function receipayWriteOffGenerate(data) {
  return request({
    url: '/fin/voucher/receipayWriteOffGenerate',
    method: 'post',
    data
  })
}

//对冲生成凭证
export function nopayWriteOffGenerate(data) {
  return request({
    url: '/fin/voucher/nopayWriteOffGenerate',
    method: 'post',
    data
  })
}

// 坏账凭证生成
export function badDebitPreWriteOffGenerate(data) {
  return request({
    url: '/fin/voucher/badDebitPreWriteOffGenerate',
    method: 'post',
    data
  })
}
// 删除凭证
export function voucherDelete(data) {
  return request({
    url: '/fin/voucher/voucherDelete',
    method: 'post',
    data
  })
}
// 预关帐按月删除凭证
export function batchDeleteShiftVoucher(data) {
  return request({
    url: '/fin/voucher/batchDeleteShiftVoucher',
    method: 'post',
    data
  })
}

// 外账 外账 外账 外账 外账 外账 外账 外账 外账 外账 外账 外账 外账 外账 外账 外账 外账 外账 外账 

//收付核销生成凭证
export function exReceipayWriteOffGenerate(data) {
  return request({
    url: '/fin/exVoucher/exReceipayWriteOffGenerate',
    method: 'post',
    data
  })
}

//对冲生成凭证
export function exNopayWriteOffGenerate(data) {
  return request({
    url: '/fin/exVoucher/exNopayWriteOffGenerate',
    method: 'post',
    data
  })
}

// 坏账凭证生成
export function exBadDebitPreWriteOffGenerate(data) {
  return request({
    url: '/fin/exVoucher/exBadDebitPreWriteOffGenerate',
    method: 'post',
    data
  })
}
// 批量删除订单转字凭证
export function batchDeleteExOrderShiftVoucher(data) {
  return request({
    url: '/fin/exVoucher/batchDeleteExOrderShiftVoucher',
    method: 'post',
    data
  })
}
// 批量删除发票转字凭证
export function batchDeleteInvoiceShiftVoucher(data) {
  return request({
    url: '/fin/exVoucher/batchDeleteInvoiceShiftVoucher',
    method: 'post',
    data
  })
}
// 删除凭证
export function exVoucherDelete(data) {
  return request({
    url: '/fin/exVoucher/exVoucherDelete',
    method: 'post',
    data
  })
}
// 收款核销详情凭证列表
export function voucherListRecv(data) {
  return request({
    url: '/fin/writeoffRecv/voucherList',
    method: 'post',
    data
  })
}
// 收款核销详情凭证列表
export function voucherListPay(data) {
  return request({
    url: '/fin/writeoffPay/voucherList',
    method: 'post',
    data
  })
}
// 收款核销详情凭证列表
export function voucherListGedging(data) {
  return request({
    url: '/fin/gedging/voucherList',
    method: 'post',
    data
  })
}
// 批量删除内会计凭证
export function batchDeleteInExVouchers(data) {
  return request({
    url: '/fin/exVoucher/batchDeleteInExVouchers',
    method: 'post',
    data
  })
}
// 应收发票详情凭证列表
export function invoiceReceivableVoucherList(data) {
  return request({
    url: '/fin/invoiceReceivable/voucherList',
    method: 'post',
    data
  })
}
// 应付发票详情凭证列表
export function invoicePaymentVoucherList(data) {
  return request({
    url: '/fin/invoicePayment/voucherList',
    method: 'post',
    data
  })
}