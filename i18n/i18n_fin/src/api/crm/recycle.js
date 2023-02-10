import request from '@/utils/request'

const RECYCLE = {}
const arr = [
  'list', //认领列表
  'export',//认领列表导出
  'claim',//公海认领
  'assign',//公海分配
  'detail', //公海拒绝回收原因详情
  { api: 'department', path: 'recycle/detail/department' }, //部门公海拒绝回收原因详情
  { api: 'querySzCode', path: '/recycle/querySzCode' }, //深圳员工部门编码
  'recall', //撤回客户
  'refuse', //拒绝客户
  'giveUp',// 主动放弃维护客户
  'getEmployeesBydpCode',//组长下的业务员
  'claimOrAssignValid',//查询被分配或认领的客户的关联公司
]
arr.forEach((api) => {
  RECYCLE[api.api || api] = (data) => request({
    url: `/crm/${api.path || 'recycle/' + api}`,
    method: 'post',
    data
  })
})
export default RECYCLE
