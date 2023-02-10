// 凭证管理模块
import request from '@/utils/request'

let arr = [
  // 业务员
  { api: 'bdListPage', path: 'cmsSchemeEmployee/listPage' },   // 业务员提成方案列表
  { api: 'bdInfo', path: 'cmsSchemeEmployee/info' },   // 业务员提成方案详情
  { api: 'bdAddOrUpdate', path: 'cmsSchemeEmployee/addOrUpdate' },   // 业务员提成方案新增/修改
  { api: 'bdSchemeDue', path: 'cmsSchemeEmployee/cmsSchemeDue' },   // 业务员提成方案到期
  { api: 'bdListHisPage', path: 'cmsSchemeEmployee/listHisPage' },   // 业务员历史提成方案列表
  { api: 'bdInfoHis', path: 'cmsSchemeEmployee/infoHis' },   // 业务员历史提成方案详情
  // 提案
  { api: 'schemeListPage', path: 'cmsScheme/listPage' },   // 提成方案列表
  { api: 'schemeInfo', path: 'cmsScheme/info' },   // 提成方案详情
  { api: 'schemeAdd', path: 'cmsScheme/add' },   // 提成方案新增/修改
  { api: 'schemeChangeStatus', path: 'cmsScheme/changeStatus' },   // 提成方案状态变更
  { api: 'schemeList', path: 'cmsScheme/list' },   // 提成方案列表（下拉）
  // 分摊组别
  { api: 'allotgroupTree', path: 'allotgroup/treeList', base: true, },   // 树形列表
  { api: 'allotgroupSave', path: 'allotgroup/save', base: true, },   // 保存
  { api: 'allotgroupList', path: 'allotgroup/list', base: true, },   // 列表
  { api: 'allotgroupSaveGroup', path: 'allotgroup/saveEmployeeAllotGroup', base: true, },   // 保存员工分摊组别
  { api: 'allotgroupInfo', path: 'allotgroup/employeeAllotGroupInfo', base: true, },   // 查看员工分摊组别
]
let API = {}
arr.forEach(item => {
  API[item.api] = (data) => request({ url: `${item.base ? '/base/webapi' : '/fin'}/${item.path}`, method: 'post', data })
});
// /fin/sysDate/getSysDate
export default API