import request from '@/utils/request'

// 应收账单列表分页查询
export function queryFiscalTermPage(data) {
  return request({
      url: '/fin/fiscalterm/queryFiscalTermPage',
      method: 'post',
      data
  })
}
export function settleOrderApply(data) {
  return request({
      url: '/fin/fiscalterm/settleOrderApply',
      method: 'post',
      data
  })
}
//应收账单详情（费用）列表分页查询
export function queryFiscalTermFeePage(data) {
  return request({
      url: '/fin/fiscalterm/queryFiscalTermFeePage',
      method: 'post',
      data
  })
}
export function queryFiscalTermFeeSummary(data) {
  return request({
      url: '/fin/fiscalterm/queryFiscalTermFeeSummary',
      method: 'post',
      data
  })
}
//应收账单信息查询
export function queryFiscalTermInfo(data) {
  return request({
      url: '/fin/fiscalterm/queryFiscalTermInfo',
      method: 'post',
      data
  })
}
export function fiscalTermCollectPageList(data) {
  return request({
    url: '/fin/fiscalterm/fiscalTermCollectPageList',
    method: 'post',
    data
  })
}
export function queryFiscalTermPageSummary(data) {
  return request({
    url: '/fin/fiscalterm/queryFiscalTermPageSummary',
    method: 'post',
    data
  })
}
export function fiscalTermCollectInfo(data) {
  return request({
    url: '/fin/fiscalterm/fiscalTermCollectInfo',
    method: 'post',
    data
  })
}
export function fiscalTermCollectPageSummary(data) {
  return request({
    url: '/fin/fiscalterm/fiscalTermCollectPageSummary',
    method: 'post',
    data
  })
}