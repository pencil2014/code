import request from '@/utils/request'

//菜单列表
export function menuList(data) {
  return request({
    url: '/base/webapi/menu/menuList',
    method: 'post',
    data
  })
}

//新增/编辑 菜单列表
export function menuAdd(data) {
  return request({
    url: '/base/webapi/menu/menuSave',
    method: 'post',
    data
  })
}

//资源列表
export function resourceList(data) {
  return request({
    url: '/base/webapi/resource/resourceList',
    method: 'post',
    data
  })
}

//资源保存
export function resourceSave(data) {
  return request({
    url: '/base/webapi/resource/resourceSave',
    method: 'post',
    data
  })
}
//资源导出
export function exportRecentData(data) {
  return request({
    url: '/base/webapi/resource/exportRecentData',
    method: 'post',
    data
  })
}
//资源导入
export function importRecentData(data) {
  return request({
    url: '/base/webapi/resource/importRecentData',
    method: 'post',
    data
  })
}

//查看菜单列表详情
export function menuInfo(data) {
  return request({
    url: '/base/webapi/menu/menuGet',
    method: 'post',
    data
  })
}

//获取菜单二级下拉列表
export function listLevel2Menu(data) {
  return request({
    url: '/base/webapi/menu/listLevel2Menu',
    method: 'post',
    data
  })
}


//获取菜单二级下的子模块数据
export function listSubResource(data) {
  return request({
    url: '/base/webapi/menu/listSubResource',
    method: 'post',
    data
  })
}

//获取用户拥有的全部系统资源
export function userAuthorityList(data) {
  return request({
    url: '/base/webapi/menu/userAuthorityList',
    method: 'post',
    data
  })
}
//保存用户系统资源
export function saveUserRoleResource(data) {
  return request({
    url: '/base/webapi/menu/saveUserRoleResource',
    method: 'post',
    data
  })
}


//删除菜单数据
export function menuDelete(data) {
  return request({
    url: '/base/webapi/menu/menuDelete',
    method: 'post',
    data
  })
}

//页面列表
export function pageList(data) {
  return request({
    url: '/base/webapi/pageResource/pageList',
    method: 'post',
    data
  })
}


//页面保存
export function pageAdd(data) {
  return request({
    url: '/base/webapi/pageResource/pageSave',
    method: 'post',
    data
  })
}

//页面保存
export function pageToModule(data) {
  return request({
    url: '/base/webapi/pageResource/pageToModule',
    method: 'post',
    data
  })
}

//查看页面详情
export function pageGet(data) {
  return request({
    url: '/base/webapi/pageResource/pageGet',
    method: 'post',
    data
  })
}

//页面删除
export function pageDelete(data) {
  return request({
    url: '/base/webapi/pageResource/pageDelete',
    method: 'post',
    data
  })
}


//页面子模块列表
export function moduleList(data) {
  return request({
    url: '/base/webapi/pageResource/moduleList',
    method: 'post',
    data
  })
}

//页面子模块保存
export function moduleSave(data) {
  return request({
    url: '/base/webapi/pageResource/moduleSave',
    method: 'post',
    data
  })
}

//查看页面子模块详情
export function moduleGet(data) {
  return request({
    url: '/base/webapi/pageResource/moduleGet',
    method: 'post',
    data
  })
}
//删除页面子模块
export function moduleDelete(data) {
  return request({
    url: '/base/webapi/pageResource/moduleDelete',
    method: 'post',
    data
  })
}

//角色列表
export function roleList(data) {
  return request({
    url: '/base/webapi/role/list',
    method: 'post',
    data
  })
}

//角色启用禁用
export function roleActived(data) {
  return request({
    url: '/base/webapi/role/actived',
    method: 'post',
    data
  })
}

//角色信息
export function roleGet(data) {
  return request({
    url: '/base/webapi/role/roleGet',
    method: 'post',
    data
  })
}

//角色信息保存
export function roleSave(data) {
  return request({
    url: '/base/webapi/role/roleSave',
    method: 'post',
    data
  })
}
//角色信息保存
export function roleAuthoritySave(data) {
  return request({
    url: '/base/webapi/role/roleAuthoritySave',
    method: 'post',
    data
  })
}

//角色信息保存
export function roleAuthorityList(data) {
  return request({
    url: '/base/webapi/role/roleAuthorityList',
    method: 'post',
    data
  })
}


//资源角色列表
export function authorityRoleList(data) {
  return request({
    url: '/base/webapi/role/authorityRoleList',
    method: 'post',
    data
  })
}

//资源角色列表
export function authorityRoleSave(data) {
  return request({
    url: '/base/webapi/role/authorityRoleSave',
    method: 'post',
    data
  })
}




//角色菜单列表
export function roleMenuRelativeList(data) {
  return request({
    url: '/base/webapi/menu/roleMenuRelativeList',
    method: 'post',
    data
  })
}

//获取系统所有菜单和用户权限
export function allMenuCheckAuth(data) {
  return request({
    url: '/base/webapi/menu/allMenuCheckAuth',
    method: 'post',
    data
  })
}


//角色列表下拉数据
export function roleSelectList(data) {
  return request({
    url: '/base/webapi/role/roleList',
    method: 'post',
    data
  })
}

//角色菜单关系
export function saveRoleMenu(data) {
  return request({
    url: '/base/webapi/menu/saveRoleMenu',
    method: 'post',
    data
  })
}

//角色已绑定菜单数据
export function roleRelativedMenuList(data) {
  return request({
    url: '/base/webapi/menu/roleRelativedMenuList',
    method: 'post',
    data
  })
}


//角色菜单关系列表
export function rolePageRelativeList(data) {
  return request({
    url: '/base/webapi/pageResource/rolePageRelativeList',
    method: 'post',
    data
  })
}

//全部页面数据
export function allPageModule(data) {
  return request({
    url: '/base/webapi/pageResource/allPageModule',
    method: 'post',
    data
  })
}

//保存页面数据关系
export function saveRolePageModule(data) {
  return request({
    url: '/base/webapi/pageResource/saveRolePageModule',
    method: 'post',
    data
  })
}

//角色已绑定页面数据
export function roleRelativedPageList(data) {
  return request({
    url: '/base/webapi/pageResource/roleRelativedPageList',
    method: 'post',
    data
  })
}

//规则列表
export function ruleList(data) {
  return request({
    url: '/base/webapi/dataPermission/ruleList',
    method: 'post',
    data
  })
}


//保存规则
export function ruleSave(data) {
  return request({
    url: '/base/webapi/dataPermission/ruleSave',
    method: 'post',
    data
  })
}

//删除规则
export function ruleDelete(data) {
  return request({
    url: '/base/webapi/dataPermission/ruleDelete',
    method: 'post',
    data
  })
}

//规则分组列表
export function ruleGroupList(data) {
  return request({
    url: '/base/webapi/dataPermission/ruleGroupList',
    method: 'post',
    data
  })
}

//规则分组列表
export function ruleGroupDelete(data) {
  return request({
    url: '/base/webapi/dataPermission/ruleGroupDelete',
    method: 'post',
    data
  })
}


//规则分组选择列表
export function ruleSelectList(data) {
  return request({
    url: '/base/webapi/dataPermission/ruleSelectList',
    method: 'post',
    data
  })
}

//保存分组选择列表
export function groupSave(data) {
  return request({
    url: '/base/webapi/dataPermission/groupSave',
    method: 'post',
    data
  })
}

//分组已关联规则列表
export function ruleGroupRelativedList(data) {
  return request({
    url: '/base/webapi/dataPermission/ruleGroupRelativedList',
    method: 'post',
    data
  })
}
//参数列表
export function paramsList(data) {
  return request({
    url: '/base/webapi/dataPermission/paramsList',
    method: 'post',
    data
  })
}

//保存参数配置
export function paramsSave(data) {
  return request({
    url: '/base/webapi/dataPermission/paramsSave',
    method: 'post',
    data
  })
}

//删除参数配置
export function paramsDelete(data) {
  return request({
    url: '/base/webapi/dataPermission/paramsDelete',
    method: 'post',
    data
  })
}

//角色规则关联列表
export function roleRuleRelativeList(data) {
  return request({
    url: '/base/webapi/dataPermission/roleRuleRelativeList',
    method: 'post',
    data
  })
}

//规则分组树形列表
export function ruleGroupTreeList(data) {
  return request({
    url: '/base/webapi/dataPermission/ruleGroupTreeList',
    method: 'post',
    data
  })
}

//角色关联分组
export function roleDpGroupSave(data) {
  return request({
    url: '/base/webapi/dataPermission/roleDpGroupSave',
    method: 'post',
    data
  })
}

//删除角色关联分组
export function roleDpGroupDelete(data) {
  return request({
    url: '/base/webapi/dataPermission/roleDpGroupDelete',
    method: 'post',
    data
  })
}

//角色已关联分组列表
export function roleRelativedGroupList(data) {
  return request({
    url: '/base/webapi/dataPermission/roleRelativedGroupList',
    method: 'post',
    data
  })
}

//员工全局数据权限列表
export function empGlobalPrivilegeList(data) {
  return request({
    url: '/base/webapi/dataPermission/empGlobalPrivilegeList',
    method: 'post',
    data
  })
}

//保存员工全局数据权限
export function empGlobalPrivilegeSave(data) {
  return request({
    url: '/base/webapi/dataPermission/empGlobalPrivilegeSave',
    method: 'post',
    data
  })
}

//保存员工全局数据权限
export function privilegeSave(data) {
  return request({
    url: '/base/webapi/dataPermission/privilegeSave',
    method: 'post',
    data
  })
}

//员工权限列表
export function userPrivilegeList(data) {
  return request({
    url: '/base/webapi/dataPermission/userPrivilegeList',
    method: 'post',
    data
  })
}


//删除员工全局数据权限
export function empGlobalPrivilegeDelete(data) {
  return request({
    url: '/base/webapi/dataPermission/empGlobalPrivilegeDelete',
    method: 'post',
    data
  })
}

//员工岗位规则列表
export function jobAssignRuleList(data) {
  return request({
    url: '/base/webapi/dataPermission/jobAssignRuleList',
    method: 'post',
    data
  })
}
//协同配置列表
export function jointAssignRuleList(data) {
  return request({
    url: '/base/webapi/jointEmployeeConfig/pageList',
    method: 'post',
    data
  })
}

//员工岗位规则删除
export function jobAssignRuleDelete(data) {
  return request({
    url: '/base/webapi/dataPermission/jobAssignRuleDelete',
    method: 'post',
    data
  })
}
//协同配置删除
export function jointAssignRuleDelete(data) {
  return request({
    url: '/base/webapi/jointEmployeeConfig/delete',
    method: 'post',
    data
  })
}
//员工岗位下拉数据
export function jobAssignRuleSave(data) {
  return request({
    url: '/base/webapi/dataPermission/jobAssignRuleSave',
    method: 'post',
    data
  })
}
//新增协同配置
export function jointAssignRuleSave(data) {
  return request({
    url: '/base/webapi/jointEmployeeConfig/save',
    method: 'post',
    data
  })
}

//批量修改员工执行人
export function jobAssignEmployeeUpdate(data) {
  return request({
    url: '/base/webapi/dataPermission/jobAssignEmployeeUpdate',
    method: 'post',
    data
  })
}

//员工岗位下拉数据
export function jobAssignRuleInfo(data) {
  return request({
    url: '/base/webapi/dataPermission/jobAssignRuleInfo',
    method: 'post',
    data
  })
}
//协同详情数据
export function jointAssignRuleInfo(data) {
  return request({
    url: '/base/webapi/jointEmployeeConfig/info',
    method: 'post',
    data
  })
}


//员工岗位下拉数据
export function getJobList(data) {
  return request({
    url: '/base/webapi/dataPermission/getJobListV2',
    method: 'post',
    data
  })
}

//航线分组列表数据
export function shippingLineGroupList(data) {
  return request({
    url: '/base/webapi/sysLinePermission/lineGroupList',
    method: 'post',
    data
  })
}

//航线分组列表保存
export function lineGroupSave(data) {
  return request({
    url: '/base/webapi/sysLinePermission/lineGroupSave',
    method: 'post',
    data
  })
}

//航线分组列表数据 删除
export function lineGroupDelete(data) {
  return request({
    url: '/base/webapi/sysLinePermission/lineGroupDelete',
    method: 'post',
    data
  })
}

//关联系统航线
export function lineGroupRelativedLine(data) {
  return request({
    url: '/base/webapi/sysLinePermission/lineGroupRelativedLine',
    method: 'post',
    data
  })
}

//关联系统航线
export function groupRelativedLineInfo(data) {
  return request({
    url: '/base/webapi/sysLinePermission/groupRelativedLineInfo',
    method: 'post',
    data
  })
}


//部门关联系统航线
export function lineGroupDeptList(data) {
  return request({
    url: '/base/webapi/sysLinePermission/lineGroupDeptList',
    method: 'post',
    data
  })
}

//部门关联系统航线 保存
export function lineGroupRelativedDept(data) {
  return request({
    url: '/base/webapi/sysLinePermission/lineGroupRelativedDept',
    method: 'post',
    data
  })
}

//删除部门关联系统航线
export function lineGroupDeptDelete(data) {
  return request({
    url: '/base/webapi/sysLinePermission/lineGroupDeptDelete',
    method: 'post',
    data
  })
}

//航线维护人列表
export function lineManagerList(data) {
  return request({
    url: '/base/webapi/sysLinePermission/lineManagerList',
    method: 'post',
    data
  })
}

//保存航线维护人
export function lineManagerSave(data) {
  return request({
    url: '/base/webapi/sysLinePermission/lineManagerSave',
    method: 'post',
    data
  })
}

//删除航线维护人
export function lineManagerDelete(data) {
  return request({
    url: '/base/webapi/sysLinePermission/lineManagerDelete',
    method: 'post',
    data
  })
}


//角色关联的员工列表
export function roleEmployeeList(data) {
  return request({
    url: '/base/webapi/role/roleEmployeeList',
    method: 'post',
    data
  })
}

//角色关联员工保存
export function roleEmployeeSave(data) {
  return request({
    url: '/base/webapi/role/roleEmployeeSave',
    method: 'post',
    data
  })
}

// 批量新增员工角色
export function multiRoleAdd(data) {
  return request({
    url: '/base/webapi/sysUser/multiRoleAdd',
    method: 'post',
    data
  })
}

// 批量取消员工角色
export function multiRoleDelete(data) {
  return request({
    url: '/base/webapi/sysUser/multiRoleDelete',
    method: 'post',
    data
  })
}

// 员工已排除资源列表接口
export function userExcludeAuthorityList(data) {
  return request({
    url: '/base/webapi/menu/userExcludeAuthorityList',
    method: 'post',
    data
  })
}

// 员工排除资源保存接口
export function saveUserExcludeResource(data) {
  return request({
    url: '/base/webapi/menu/saveUserExcludeResource',
    method: 'post',
    data
  })
}

// 用户角色包涵的二级权限
export function listExcludeSubResource(data) {
  return request({
    url: '/base/webapi/menu/listExcludeSubResource',
    method: 'post',
    data
  })
}
// 大航线
export function sysLinePermissionGroupList(data) {
  return request({
    url: '/base/webapi/sysLinePermission/groupList',
    method: 'post',
    data
  })
}












