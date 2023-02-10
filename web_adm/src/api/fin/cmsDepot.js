import request from '@/utils/request'

//销售发票列表
export function cmsInvoiceList(data) {
  return request({
    url: '/fin/webapi/cmsInvoice/list',
    method: 'post',
    data
  })
}
//删除
export function cmsInvoiceDelete(data) {
  return request({
    url: '/fin/webapi/cmsInvoice/delete',
    method: 'post',
    data
  })
}
//保存
export function cmsInvoiceSave(data) {
  return request({
    url: '/fin/webapi/cmsInvoice/save',
    method: 'post',
    data
  })
}
//导出
export function cmsInvoiceExport(data) {
  return request({
    url: '/fin/webapi/cmsInvoice/export',
    method: 'post',
    data
  })
}

//提成申请列表
export function cmsApplyListPage(data) {
  return request({
    url: '/fin/cmsApply/listPage',
    method: 'post',
    data
  })
}
//提成申请详情
export function cmsApplyInfo(data) {
  return request({
    url: '/fin/cmsApply/info',
    method: 'post',
    data
  })
}
//提成申请审批
export function cmsApplyCmsApplyApproval(data) {
  return request({
    url: '/fin/cmsApply/cmsApplyApproval',
    method: 'post',
    data
  })
}
//提成申请导出
export function commonQueryDataExportExcel(data) {
  return request({
    url: '/fin/common/queryDataExportExcel',
    method: 'post',
    data
  })
}
//提成批量发放
export function cmsApplyBatchPayImport(data) {
  return request({
    url: '/fin/cmsApply/batchPayImport',
    method: 'post',
    data
  })
}
//提成申请财务审批列表
export function cmsApplyListFinPage(data) {
  return request({
    url: '/fin/cmsApply/listFinPage',
    method: 'post',
    data
  })
}
//提成申请异常客服审批列表
export function cmsApplyListExcepserverPage(data) {
  return request({
    url: '/fin/cmsApply/listExcepserverPage',
    method: 'post',
    data
  })
}
//提成申请上级审批列表
export function cmsApplyListSuperiorPage(data) {
  return request({
    url: '/fin/cmsApply/listSuperiorPage',
    method: 'post',
    data
  })
}
//提成申请HR核算列表
export function cmsApplyListHrPage(data) {
  return request({
    url: '/fin/cmsApply/listHrPage',
    method: 'post',
    data
  })
}

//obd利润列表
export function profitObdProfitListPage(data) {
  return request({
    url: '/fin/profit/obdProfitListPage',
    method: 'post',
    data
  })
}
//obd利润明细列表
export function profitObdProfitDetailListPage(data) {
  return request({
    url: '/fin/profit/obdProfitDetailListPage',
    method: 'post',
    data
  })
}