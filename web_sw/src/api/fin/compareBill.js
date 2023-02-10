import request from '@/utils/request'
// 银行流水列表
export function bankListPage(data) {
  return request({ url: '/fin/bankAccStatement/listPage', method: 'post', data })
}
// 银行流水导入
export function importBankSeq(data) {
  return request({ url: '/fin/bankAccStatement/importBankSeq', method: 'post', data })
}
// 银行账单列表
export function bankBillListPage(data) {
  return request({ url: '/fin/bankAccStatement/listBillPage', method: 'post', data })
}
// 银行账单详情
export function getBankBillInfo(data) {
  return request({ url: '/fin/bankAccStatement/getBankBillInfo', method: 'post', data })
}
// 对账
export function bankCompare(data) {
  return request({ url: '/fin/bankAccStatement/compare', method: 'post', data })
}
// 银行流水对账列表
export function bankCompareListPage(data) {
  return request({ url: '/fin/bankAccStatement/listComparePage', method: 'post', data })
}
// 银行流水对账详情
export function bankCompareInfo(data) {
  return request({ url: '/fin/bankAccStatement/getCompareInfo', method: 'post', data })
}
// 银行流水对账详情列表
export function bankCompareInfoListPage(data) {
  return request({ url: '/fin/bankAccStatement/listCompareDetailPage', method: 'post', data })
}
// 重新对账
export function bankReCompare(data) {
  return request({ url: '/fin/bankAccStatement/reCompare', method: 'post', data })
}
// 银行流水删除
export function deleteBankSeq(data) {
  return request({ url: '/fin/bankAccStatement/deleteBankSeq', method: 'post', data })
}
// 标记流水是否参与对账
export function remarkCompare(data) {
  return request({ url: '/fin/bankAccStatement/remarkCompare', method: 'post', data })
}
// 标记流水是否参与对账
export function removeCompareDetail(data) {
  return request({ url: '/fin/bankAccStatement/removeCompareDetail', method: 'post', data })
}
