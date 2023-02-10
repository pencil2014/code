import request from '@/utils/request'

//超期汇总统计
export function queryCustQuotaArrearSum(data) {
  return request({
    url: '/fin/fiscalterm/queryCustQuotaArrearSum',
    method: 'post',
    data
  })
}
//超额汇总统计
export function creditAccountOverQuotaSum(data) {
  return request({
    url: '/fin/creditAccount/settleUnit/creditAccountOverQuotaSum',
    method: 'post',
    data
  })
}
//超额超期查询接口
export function queryOverQuotaAndArrear(data) {
  return request({
    url: '/fin/creditAccount/queryOverQuotaAndArrear',
    method: 'post',
    data
  })
}
export function getListAmtSummary(data) {
  return request({
    url: '/fin/creditAccount/settleUnit/recvPayBalanceDetail/getListAmtSummary',
    method: 'post',
    data
  })
}
export function recvPayBalanceDetailListPage(data) {
  return request({
    url: '/fin/creditAccount/settleUnit/recvPayBalanceDetail/listPage',
    method: 'post',
    data
  })
}
export function recvPayBalanceDetailList(data) {
  return request({
    url: '/fin/creditAccount/settleUnit/recvPayBalanceDetail/listPage',
    method: 'post',
    data
  })
}