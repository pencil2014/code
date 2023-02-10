import request from '@/utils/request'

export function listPage(data) {
  return request({
    url: '/fin/supplierBill/listPage',
    method: 'post',
    data
  })
}
export function saveSupplierBill(data) {
  return request({
    url: '/fin/supplierBill/saveSupplierBill',
    method: 'post',
    data
  })
}
export function getSupplierBillDetail(data) {
  return request({
    url: '/fin/supplierBill/getSupplierBillDetail',
    method: 'post',
    data
  })
}
export function listSupplierBillFeePage(data) {
  return request({
    url: '/fin/supplierBill/listSupplierBillFeePage',
    method: 'post',
    data
  })
}
export function listCompanyFeePage(data) {
  return request({
    url: '/fin/supplierBill/listCompanyFeePage',
    method: 'post',
    data
  })
}
export function confirmAll(data) {
  return request({
    url: '/fin/supplierBill/confirmAll',
    method: 'post',
    data
  })
}
export function importFee(data) {
  return request({
    url: '/fin/supplierBill/importFee',
    method: 'post',
    data
  })
}
export function lockOrUnlockFee(data) {
  return request({
    url: '/fin/supplierBill/lockOrUnlockFee',
    method: 'post',
    data
  })
}
export function supplierGenerateSo(data) {
  return request({
    url: '/fin/supplierBill/supplierGenerateSo',
    method: 'post',
    data
  })
}
export function diffCompare(data) {
  return request({
    url: '/fin/supplierBill/diffCompare',
    method: 'post',
    data
  })
}
// 删除费用
export function deleteSupplierBillFee(data) {
  return request({
    url: '/fin/supplierBill/deleteSupplierBillFee',
    method: 'post',
    data
  })
}
// 自动导入费用
export function autoImportFee(data) {
  return request({
    url: '/fin/supplierBill/autoImportFee',
    method: 'post',
    data
  })
}
// 结算单导入费用
export function settleOrderImportFee(data) {
  return request({
    url: '/fin/supplierBill/settleOrderImportFee',
    method: 'post',
    data
  })
}
// 费用导入
export function listImportCompanyFeePage(data) {
  return request({
    url: '/fin/supplierBill/listImportCompanyFeePage',
    method: 'post',
    data
  })
}
// 执行对账
export function compare(data) {
  return request({
    url: '/fin/supplierBill/compare',
    method: 'post',
    data
  })
}
// 供应商对账结果详情
export function getSupplierBillCompareDetail(data) {
  return request({
    url: '/fin/supplierBill/getSupplierBillCompareDetail',
    method: 'post',
    data
  })
}
// 供应商费用对账详情列表查询
export function listSupplierBillFeeCompareLogPage(data) {
  return request({
    url: '/fin/supplierBill/listSupplierBillFeeCompareLogPage',
    method: 'post',
    data
  })
}
// 公司费用对账详情列表查询
export function listCompanyFeeCompareLogPage(data) {
  return request({
    url: '/fin/supplierBill/listCompanyFeeCompareLogPage',
    method: 'post',
    data
  })
}
// 费用导入汇总信息查询（自动导入、结算单导入）
export function getImportCompanyFeeTotal(data) {
  return request({
    url: '/fin/supplierBill/getImportCompanyFeeTotal',
    method: 'post',
    data
  })
}
// 供应商对账明细列表查询
export function listCompareLogPage(data) {
  return request({
    url: '/fin/supplierBill/listCompareLogPage',
    method: 'post',
    data
  })
}
// 供应商对账明细系统费用列表查询
export function listCompareLogSysFeePage(data) {
  return request({
    url: '/fin/supplierBill/listCompareLogSysFeePage',
    method: 'post',
    data
  })
}
// 供应商对账明细导出
export function exportCompareLog(data) {
  return request({
    url: '/fin/supplierBill/exportCompareLog',
    method: 'post',
    data
  })
}
// 供应商对账 系统明细导出
export function exportCompareLogSysFee(data) {
  return request({
    url: '/fin/supplierBill/exportCompareLogSysFee',
    method: 'post',
    data
  })
}
// 供应商对账 生成结算单
export function settleOrderApply(data) {
  return request({
    url: '/fin/supplierBill/settleOrderApply',
    method: 'post',
    data
  })
}
// 供应商对账 生成多个结算单
export function settleOrderApplyGroup(data) {
  return request({
    url: '/fin/supplierBill/settleOrderApplyGroup',
    method: 'post',
    data
  })
}
// 供应商对账 发送对账差异
export function sendCompareLog(data) {
  return request({
    url: '/fin/supplierBill/sendCompareLog',
    method: 'post',
    data
  })
}