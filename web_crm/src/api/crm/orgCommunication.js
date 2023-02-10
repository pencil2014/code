import request from '@/utils/request'

// 供应商跟进记录
const FOLLOW = {}
const arr = [
  /**************** 客户 ****************/
  { api: 'customerList', path: 'orgCommunication/customer/list' }, //单个客户跟进记录
  { api: 'customerAllList', path: 'orgCommunication/customer/allList' }, //所有客户跟进记录
  { api: 'customerAllExport', path: 'orgCommunication/customer/allList/export' }, //所有客户跟进记录
  { api: 'customerOrgDetail', path: 'orgCommunication/customer/orgDetail' }, //所有客户跟进记录
  'addOrUpdateCustomerCommu',//新增或更新跟进记录
  'customerDetail',//跟进详情
  'customerDeleteCommun',//删除记录
  /**************** 供应商 ****************/
  { api: 'supplierList', path: 'orgCommunication/supplier/list' }, //单个供应商跟进记录
  { api: 'supplierAllList', path: 'orgCommunication/supplier/allList' }, //所有供应商跟进记录
  { api: 'supplierAllExport', path: 'orgCommunication/supplier/allList/export' }, //所有客户跟进记录
  { api: 'supplierOrgDetail', path: 'orgCommunication/supplier/orgDetail' }, //所有客户跟进记录
  'addOrUpdateSupplierCommu',//新增或更新跟进记录
  'supplierDetail',//跟进详情
  'supplierDeleteCommun',//删除记录
  /**************** 通用 ****************/
  'screenshotView',//附件查看
]
arr.forEach((api) => {
  FOLLOW[api.api || api] = (data) => request({
    url: `/crm/${api.path || 'orgCommunication/' + api}`,
    method: 'post',
    data
  })
})
export default FOLLOW