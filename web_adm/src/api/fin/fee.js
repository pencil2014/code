import request from '@/utils/request'

export function uploadBusinessFee(data) {
  return request({
    url: '/fin/fee/uploadBusinessFee',
    method: 'post',
    data
  })
}
export function saveOrderBizFee(data) {
  return request({
    url: '/fin/fee/saveOrderBizFee',
    method: 'post',
    data
  })
}
export function orderFeeList(data) {
  return request({
    url: '/fin/fee/orderFeeList',
    method: 'post',
    data
  })
}
export function saveAsTemplate(data) {
  return request({
    url: '/fin/fee/saveAsTemplate',
    method: 'post',
    data
  })
}
export function batchModifySettleUnit(data) {
  return request({
    url: '/fin/fee/batchModifySettleUnit',
    method: 'post',
    data
  })
}
export function confirmOrderFeeInvoiceStatus(data) {
  return request({
    url: '/fin/fee/confirmOrderFeeInvoiceStatus',
    method: 'post',
    data
  })
}
export function confirmOrderFee(data) {
  return request({
    url: '/fin/fee/confirmOrderFee',
    method: 'post',
    data
  })
}
export function myTemplate(data) {
  return request({
    url: '/fin/fee/myTemplate',
    method: 'post',
    data
  })
}
// export function getTemplateFee(data) {
//   return request({
//     url: '/fin/fee/getTemplateFee',
//     method: 'post',
//     data
//   })
// }
export function getOrderProfit(data) {
  return request({
    url: '/fin/fee/getOrderProfit',
    method: 'post',
    data
  })
}
export function getOrderFeeStat(data) {
  return request({
    url: '/fin/fee/getOrderFeeStat',
    method: 'post',
    data
  })
}
// export function saveOrderBizFeeAfFinClose(data) {
//   return request({
//     url: '/fin/fee/saveOrderBizFeeAfFinClose',
//     method: 'post',
//     data
//   })
// }
// export function saveOrderSpecialFeeAfFinClose(data) {
//   return request({
//     url: '/fin/fee/saveOrderSpecialFeeAfFinClose',
//     method: 'post',
//     data
//   })
// }
export function orderProfitShareList(data) {
  return request({
    url: '/fin/fee/orderProfitShareList',
    method: 'post',
    data
  })
}
export function orderFeeHistory(data) {
  return request({
    url: '/fin/fee/orderFeeHistory',
    method: 'post',
    data
  })
}
export function getOrderTaxStat(data) {
  return request({
    url: '/fin/fee/getOrderTaxStat',
    method: 'post',
    data
  })
}
export function orderFeeCount(data) {
  return request({
    url: '/fin/fee/orderFeeCount',
    method: 'post',
    data
  })
}
export function listPage(data) {
  return request({
    url: '/fin/fee/listPage',
    method: 'post',
    data
  })
}
// 我的专项管理费列表
export function mySpecialList(data) {
  return request({
    url: '/fin/fee/mySpecialList',
    method: 'post',
    data
  })
}
// 我的专项管理费详情
export function mySpecialDetail(data) {
  return request({
    url: '/fin/fee/mySpecialDetail',
    method: 'post',
    data
  })
}
// 费用列表-确认费用
export function confirmFee(data) {
  return request({
    url: '/fin/fee/confirmFee',
    method: 'post',
    data
  })
}
export function orderCloseInfo(data) {
  return request({
    url: '/fin/fee/orderCloseInfo',
    method: 'post',
    data
  })
}
export function deleteTemplate(data) {
  return request({
    url: '/fin/fee/deleteTemplate',
    method: 'post',
    data
  })
}
export function setAgentCompany(data) {
  return request({
    url: '/fin/fee/setAgentCompany',
    method: 'post',
    data
  })
}
export function cancelAgentCompany(data) {
  return request({
    url: '/fin/fee/cancelAgentCompany',
    method: 'post',
    data
  })
}
export function cancleConfirmOrderFee(data) {
  return request({
    url: '/fin/fee/cancleConfirmOrderFee',
    method: 'post',
    data
  })
}
export function querySourceTypeByNo(data) {
  return request({
    url: '/fin/fee/querySourceTypeByNo',
    method: 'post',
    data
  })
}
export function getListAmtSummary(data) {
  return request({
    url: '/fin/fee/getListAmtSummary',
    method: 'post',
    data
  })
}
export function allFeeApplySettleOrder(data) {
  return request({
    url: '/fin/fee/allFeeApplySettleOrder',
    method: 'post',
    data
  })
}
export function feeRoute(data) {
  return request({
    url: '/fin/fee/feeRoute',
    method: 'post',
    data
  })
}
export function orderRoute(data) {
  return request({
    url: '/fin/fee/orderRoute',
    method: 'post',
    data
  })
}
export function groupSettleOrderApply(data) {
  return request({
    url: '/fin/fee/groupSettleOrderApply',
    method: 'post',
    data
  })
}
export function listCommonFeePage(data) {
  return request({
    url: '/fin/fee/listCommonFeePage',
    method: 'post',
    data
  })
}
export function surplusStatementExport(data) {
  return request({
    url: '/fin/fee/surplusStatement/export',
    method: 'post',
    data
  })
}
export function bizDetailList(data) {
  return request({
    url: '/fin/fee/bizDetailList',
    method: 'post',
    data
  })
}
export function updateOrderFeeRemark(data) {
  return request({
    url: '/fin/fee/updateOrderFeeRemark',
    method: 'post',
    data
  })
}
// export function orderInfoForFin(data) { // 弃用
//   return request({
//     url: '/order/internal/fin/main/info',
//     method: 'post',
//     data
//   })
// }
export function orderMainInfo(data) {
  return request({
    url: '/fin/orderFee/orderMainInfo',
    method: 'post',
    data
  })
}
export function saveOrderLateFee(data) {
  return request({
    url: '/fin/fee/saveOrderLateFee',
    method: 'post',
    data
  })
}
export function updateOrderFeeBl(data) {
  return request({
    url: '/fin/fee/updateOrderFeeBl',
    method: 'post',
    data
  })
}
// 修改提单号
export function batchUpdateOrderFeeBl(data) {
  return request({
    url: '/fin/fee/batchUpdateOrderFeeBl',
    method: 'post',
    data
  })
}
// 修改负数跟进人
export function updateNegativeFollower(data) {
  return request({
    url: '/fin/fee/updateNegativeFollower',
    method: 'post',
    data
  })
}
export function bizFeeSaveVerify(data) {
  return request({
    url: '/fin/fee/bizFeeSaveVerify',
    method: 'post',
    data
  })
}
export function bizFeeSaveApply(data) {
  return request({
    url: '/fin/fee/bizFeeSaveApply',
    method: 'post',
    data
  })
}
export function recFeeList(data) {
  return request({
    url: '/fin/fee/recFeeList',
    method: 'post',
    data
  })
}
export function groupBySettleCorpListPage(data) {
  return request({
    url: '/fin/fee/groupBySettleCorpListPage',
    method: 'post',
    data
  })
}
export function groupBySettleCorpExport(data) {
  return request({
    url: '/fin/fee/groupBySettleCorpExport',
    method: 'post',
    data
  })
}
export function orderFeeListByCorp(data) {
  return request({
    url: '/fin/fee/orderFeeListByCorp',
    method: 'post',
    data
  })
}
export function feeAgentValid(data) {
  return request({
    url: '/fin/fee/feeAgentValid',
    method: 'post',
    data
  })
}
// 导出对账单
export function exportCompareFeeList(data) {
  return request({
    url: '/fin/fee/exportCompareFeeList',
    method: 'post',
    data
  })
}
// 费用列表生成账单
export function generateBill(data) {
  return request({
    url: '/fin/fee/generateBill',
    method: 'post',
    data
  })
}
// 按结算单位修改结算单位下所有应收费用的关联提单号
export function updateBlByCorp(data) {
  return request({
    url: '/fin/fee/updateBlByCorp',
    method: 'post',
    data
  })
}