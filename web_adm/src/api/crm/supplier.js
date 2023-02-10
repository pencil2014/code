import request from '@/utils/request'

// 供应商信息模糊查询
export let supplierList = data => request({ url: '/crm/supplier/list', method: 'post', data })
// 根据供应商ID获取供应商信息
export let supplierInfo = data => request({ url: '/crm/supplier/info', method: 'post', data })
// 客商信息模糊查询
export let customerList = data => request({ url: '/crm/customer/list', method: 'post', data })
// 潜在客户和现有客户
export let potentialAndClient = data => request({ url: '/crm/customer/list/potentialAndClient', method: 'post', data })
// 所有状态的委托单位查询 /customer/list/allStatus
export let customerListAllStatus = data => request({ url: '/crm/customer/list/allStatus', method: 'post', data })
// 结算单位模糊查询
export let customerSettlementList = data => request({ url: '/crm/customer/settlementList', method: 'post', data })
// 根据客商ID获取客商信息
export let customerInfo = data => request({ url: '/crm/customer/info', method: 'post', data })
// 根据公司ID获取寄件历史地址信息
export let orgPostContactList = data => request({ url: '/crm/orgPostContact/list', method: 'post', data })
// 供应商信息模糊查询
export let orgValidList = data => request({ url: '/crm/org/listValid', method: 'post', data })
const SUPPLIER = {}
const arr = [
  /**************** 供应商类型接口 ****************/
  { api: 'categoryList', baseUrl: '/base/webapi/supplier/category/allList', method: 'get' }, //
  /**************** 客商信息模糊查询 ****************/
  'list', //用于黑名单搜索公司下拉
  /**************** 供应商列表 ****************/
  'mySupplierList', //供应商列表
  'supplierList',//供应商列表-领导
  'collision', //撞客查询
  { api: 'mySupplierListExport', path: 'supplier/mySupplierList/export' }, //导出我的供应商列表
  { api: 'generateContractNo', path: 'supplier/contract/generateContractNo' }, //生成合同编号GYS
  /**************** 爱企查 ****************/
  { api: 'aiqichaList', path: 'aiqicha/list' }, //导出我的供应商列表
  { api: 'aiqichaDetail', path: 'aiqicha/detail' }, //导出我的供应商列表
  /**************** 供应商列表详情及新建 ****************/
  'confirmPreview', //关闭已修改提醒
  'searchCompany', //搜索供应商新增信息
  'searchAbroad', // 海外供应商查询
  'basicInfo', //供应商基本信息
  'saveBasicInfo', //保存供应商基本信息
  'saveContactAndAccount', //保存供应商联系人、银行信息
  'submit', //供应商信息提交审核
  'updateSubmit', //更新后提交审核
  'verifyStatusInfo', //提交审核展示信息
  // 'removeMaintainer', //解绑
  'alterMaintainer', //更改维护人
  /**************** 供应商部审核列表 ****************/
  'myVerifySupplierList', //供应商部审核列表
  'verifyInfo', //供应商部审核详情
  'verify', //确认审核通过|拒绝
  'refuseConfirm', //确认审核拒绝 用于关闭详情页内头部显示的拒绝原因
  { api: 'myVerifySupplierListExport', path: 'supplier/myVerifySupplierList/export' }, //导出供应商部审核列表
  /**************** 其它操作 ****************/
  // { api: 'claim', path: 'recycle/claim' }, //认领
  /**************** 供应商列表详情-日志 ****************/
  // { api: 'logSList', path: 'orgOpLog/supplier/list' }, //供应商操作日志
  /**************** 供应商列表详情-订单记录 ****************/
  { api: 'orderList', baseUrl: '/order/shiporder/supplier/order/list' }, //供应商订单记录
  // { api: 'orderCount', baseUrl: '/order/shiporder/supplier/order/count' }, //供应商订单统计
  /**************** 供应商回收日志 ****************/
  'bdRemoveLog', //供应商回收日志
  'delete' //删除未生效供应商
]
arr.forEach(api => {
  SUPPLIER[api.api || api] = data =>
    request({
      url: api.baseUrl || `/crm/${api.path || 'supplier/' + api}`,
      method: api.method || 'post',
      data,
      params: {}
    })
})
export default SUPPLIER
