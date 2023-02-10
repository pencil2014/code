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