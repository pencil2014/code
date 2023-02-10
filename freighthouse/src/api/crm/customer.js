import request from '@/utils/request'

const CUSTOMER = {}
const arr = [
  /**************** 更改备注 ****************/
  'updateOrgRemark', //更改备注
  /**************** 潜在客户列表 ****************/
  // 'potentialList', //潜在客户列表
  'customerList', //客户列表 分潜在和下单
  'alterMaintainer', //更改维护人
  'setMaintainer', //设置主维护人
  /**************** 客商信息模糊查询 ****************/
  'list', //用于黑名单搜索公司下拉
  /**************** 客户列表 ****************/
  'myCustomerList', //客户列表
  'listForRole', //财务客户列表
  'collision',  //撞客查询myCustomerList
  'custCollision',//新增时撞客查询
  'isOrderMaintainer',  //维护人客户下单属性
  'batchHandoverBd',  //批量交接解绑
  { api: 'myCustomerListExport', path: 'customer/myCustomerList/export' }, //导出我的客户列表
  { api: 'customerListExport', path: 'customer/myCustomerList/export' }, //导出我的客户列表
  { api: 'delayVerify', path: 'customer/delayVerify'}, //申请延期
  { api: 'subDelayVerify', path: 'customer/updateDelayVerify'}, //同意下单延期申请
  { api: 'refuseDelayVerify', path: 'customer/updateDelayVerifyRemark'}, //拒绝下单延期申请
  { api: 'subVisitDelayVerify', path: 'customer/visit/delay/verify/pass'}, //同意拜访延期申请
  { api: 'refuseVisitDelayVerify', path: 'customer/visit/delay/verify/refuse'}, //拒绝拜访延期申请
  { api: 'delayVerifyInfo', path: 'customer/delayVerifyInfo'}, //查询延期申请状态
  { api: 'tobeOrder', path: 'customer/submitOrderMaintainer'}, //申请成为下单维护人
  { api: 'subTobeOrder', path: 'customer/passOrderMaintainer'}, //同意成为下单维护人
  { api: 'refuseTobeOrder', path: 'customer/refuseOrderMaintainer'}, //拒绝成为下单维护人
  { api: 'isFreezeMaintainer', path: 'customer/isFreezeMaintainer'}, //解冻、冻结维护人
  { api: 'addBindMaintainer', path: 'customer/addBindMaintainer'}, //obd绑定、解绑下单bd
  { api: 'verifyList', path: 'customer/verify/list'}, //客户部审核列表new
  { api: 'verifyApply', path: 'customer/verify/apply'}, //提交资质认证
  { api: 'verifyDetail', path: 'customer/verify/detail'}, //客户关系审核详情
 // { api: 'relationCustomerList', path: 'customer/relation/customerList'}, //关联公司名称-旧
 { api: 'relationCustomerList', path: 'customer/relation/customerNameList'}, //关联公司名称-新
 { api: 'getGenList', path: 'customer/general/bind/search'}, //搜索要维护的公司列表
 { api: 'generalBind', path: 'customer/general/bind'}, //添加普通维护人
 { api: 'getEname', path: 'customer/shortEname/get'}, //详情里根据中文简称返回英文简称
 { api: 'visitCustomerList', path: 'customer/visitPlan/customerList'}, //拜访计划搜索客户
 { api: 'getOPMaintainer', path: 'customer/communication/potential/employee'}, //根据客户id搜索下单/潜在维护人
 { api: 'getLatestDelay', path: 'delay/latest'}, //查询客户最近审核延期的时间
 { api: 'getCustLevel', path: 'customer/level/grade'}, //查询客户等级
 { api: 'updateCustLevel', path: 'customer/level/grade/change'}, //修改客户等级
 { api: 'getLevelVerify', path: 'customer/level/grade/verify/list'}, //修改客户等级
 { api: 'approveLevelVerify', path: 'customer/level/grade/approve'}, //审核客户等级

 "getDelayDate",//获取拜访延伸申请时间
 "verifyAndOrderMaintainer",//资质认证和下单维护人一起提交

  /**************** 爱企查 ****************/
  { api: 'aiqichaList', path: 'cross/search', }, //导出我的客户列表
  { api: 'aiqichaDetail', path: 'cross/detail', }, //导出我的客户列表
  // { api: 'aiqichaList', path: 'aiqicha/list', }, //导出我的客户列表
  // { api: 'aiqichaDetail', path: 'aiqicha/detail', }, //导出我的客户列表
  /**************** 客户列表详情及新建 ****************/
  'confirmPreview', //关闭已修改提醒
  'searchCompany', //搜索客户新增信息
  'searchAbroad', //海外客户查询
  'basicInfo', //客户基本信息
  'saveBasicInfo', //保存客户基本信息
  'saveContactAndAccount', //保存客户联系人、银行信息
  'submit', //客户信息提交审核
  'updateSubmit', //更新后提交审核
  'verifyStatusInfo',//提交审核展示信息
  'removeMaintainer', //解绑
  'handoverMaintainer', //客户部解绑维护人
  'addMaintainer', //新增维护人
  'editMaintainer',//编辑维护人
  'setMaintainerOrder', //设置维护人是否用于下单
  /**************** 客户部审核列表 ****************/
  'myVerifyCustomerList',  //客户部审核列表
  'verify', //确认审核通过|拒绝
  'refuseConfirm', //确认审核拒绝 用于关闭详情页内头部显示的拒绝原因
  'verifyInfo',  //客户部审核详情
  { api: 'customerInfo', path: 'customer/customer/info' }, //审核详情
  { api: 'myVerifyCustomerListExport', path: 'customer/myVerifyCustomerList/export' }, //导出客户部审核列表
  'custLevelUpdate',//更新客户级别
  /**************** 其它操作 ****************/
  { api: 'claim', path: 'recycle/claim' }, //认领
  /**************** 客户列表详情-结算 ****************/
  { api: 'settleDetail', path: 'custSettle/detail' }, //结算信息
  { api: 'settleSave', path: 'custSettle/save' }, //结算保存
  /**************** 客户列表详情-日志 ****************/
  { api: 'logCList', path: 'orgOpLog/customer/list' }, //客户操作日志
  { api: 'logSList', path: 'orgOpLog/supplier/list' }, //供应商操作日志
  { api: 'logScList', path: 'orgOpLog/shippingCarrier/list' }, //船司操作日志
  /**************** 客户列表详情-订单记录 ****************/
  { api: 'orderList', baseUrl: '/order/shiporder/customer/order/list' }, //客户订单记录
  { api: 'orderCount', baseUrl: '/order/shiporder/customer/order/count' }, //客户订单统计
  /**************** 客户回收日志 ****************/
  'bdRemoveLog',  //客户回收日志
  'delete', // 删除未生效客户
  'deleteCustomer', //20220531-删除客户信息，关联的订单一并删除
  'setBdServiceMode', //设置维护人服务模式
  'addBdAssistant', //新增销售助理
  'removeBdAssistant', //删除销售助理
  'joinWhitelist', //加入白名单
  'recallWhitelist',//撤出白名单
  'overSeasCustomerSave',//海外信息保存
  'statusUpdate',//资质认证把已认证改成认证失败
  'match',//新增客户，相似度查询
]
arr.forEach((api) => {
  CUSTOMER[api.api || api] = (data) => request({
    url: api.baseUrl || `/crm/${api.path || 'customer/' + api}`,
    method: 'post',
    data
  })
})
export default CUSTOMER
// 客户认领
export function claimCustomer(data) {
  return request({
    url: '/crm/recycle/claim',
    method: 'post',
    data
  })
}
