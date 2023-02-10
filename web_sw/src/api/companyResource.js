import request from '@/utils/request'


//组织架构树形列表
export function departmentTreeList(data) {
  return request({
    url: '/base/webapi/dept/list',
    method: 'post',
    data
  })
}
//员工列表
export function employeeList(data) {
  return request({
    url: '/base/webapi/dept/employee/list',
    method: 'post',
    data
  })
}

//员工信息
export function employeeInfo(data) {
  return request({
    url: '/base/webapi/dept/employee/info',
    method: 'post',
    data
  })
}

//修改系统用户失效状态
export function sysUserActived(data) {
  return request({
    url: '/base/webapi/sysUser/actived',
    method: 'post',
    data
  })
}

//发送激活邮件
export function sendActivedEmail(data) {
  return request({
    url: '/base/webapi/sysUser/sendActivedEmail',
    method: 'post',
    data
  })
}


//员工职务列表
export function employeeTileList(data) {
  return request({
    url: '/base/webapi/dept/employeeTileList',
    method: 'post',
    data
  })
}
//员工职务保存
export function employeeTitleSave(data) {
  return request({
    url: '/base/webapi/dept/employeeTileSave',
    method: 'post',
    data
  })
}

//组织架构列表
export function departmentList(data) {
  return request({
    url: '/base/webapi/dept/departmentList',
    method: 'post',
    data
  })
}

//组织架构列表
export function departmentSave(data) {
  return request({
    url: '/base/webapi/dept/departmentSave',
    method: 'post',
    data
  })
}

//保存员工信息
export function employeeSave(data) {
  return request({
    url: '/base/webapi/dept/employeeSave',
    method: 'post',
    data
  })
}
//员工离职
export function employeeLeave(data) {
  return request({
    url: '/base/webapi/dept/employee/leave',
    method: 'post',
    data
  })
}

//员工职务列表下拉选择数据
export function employeeTileSelectList(data) {
  return request({
    url: '/base/webapi/dept/employeeTileSelectList',
    method: 'post',
    data
  })
}

//系统用户下拉类表
export function sysUserList(data) {
  return request({
    url: '/base/webapi/sysUser/list',
    method: 'post',
    data
  })
}

//保存系统用户
export function sysUserSave(data) {
  return request({
    url: '/base/webapi/sysUser/sysUserSave',
    method: 'post',
    data
  })
}

//员工下拉列表
export function employeeSelectlist(data) {
  return request({
    url: '/base/webapi/dept/employeeSelectlist',
    method: 'post',
    data
  })
}

//员工角色信息
export function sysUserRoleInfo(data) {
  return request({
    url: '/base/webapi/sysUser/sysUserRoleInfo',
    method: 'post',
    data
  })
}
//员工角色信息
export function roleSave(data) {
  return request({
    url: '/base/webapi/sysUser/roleSave',
    method: 'post',
    data
  })
}

//结算单位下拉列表
export function settleUnitSelectList(data) {
  return request({
    url: '/fin/settleUnit/list',
    method: 'post',
    data: data.isAdd ? data : { ...data, containHistoryUnitName: 'yes' }
  })
}


//结算单位列表
export function settleUnitList(data) {
  return request({
    url: '/fin/settleUnit/listPage',
    method: 'post',
    data
  })
}
//结算单位服务项
export function serviceItemlist(data) {
  return request({
    url: '/fin/settleUnit/serviceItemlist',
    method: 'post',
    data
  })
}
//结算单位修改财务代码
export function changeFinCode(data) {
  return request({
    url: '/fin/settleUnit/changeFinCode',
    method: 'post',
    data
  })
}
//结算单位修改是否可录入费用
export function changeFeeForbid(data) {
  return request({
    url: '/fin/settleUnit/changeFeeForbid',
    method: 'post',
    data
  })
}



//员工岗位下拉
export function jobSelectList(data) {
  return request({
    url: '/base/webapi/dept/jobDefineSelectList',
    method: 'post',
    data
  })
}

//角色保存岗位
export function jobSave(data) {
  return request({
    url: '/base/webapi/sysUser/jobSave',
    method: 'post',
    data
  })
}


//公司员工列表
export function deptEmployeeList(data) {
  return request({
    url: '/base/webapi/dept/employee/list',
    method: 'post',
    data
  })
}
//删除
export function jobAssignRuleBatchDelete(data) {
  return request({
    url: '/base/webapi/dataPermission/jobAssignRuleBatchDelete',
    method: 'post',
    data
  })
}
//航线
export function getLineGroupList(data) {
  return request({
    url: '/base/webapi/sysLinePermission/lineGroupList',
    method: 'post',
    data
  })
}

// 系统航线保存
export function userRelationSave(data) {
  return request({
    url: '/base/webapi/systemLine/userRelationSave',
    method: 'post',
    data
  })
}
// 系统航线详情
export function userRelationInfo(data) {
  return request({
    url: '/base/webapi/systemLine/userRelationInfo',
    method: 'post',
    data
  })
}