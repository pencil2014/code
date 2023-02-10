import request from '@/utils/request'

const DIMISSION = {}
const arr = [
  'handover', //申请离职
  { api: 'assignList', path: 'resignation/cust/assign/list' }, //获取需要分配的客户列表
  { api: 'claimList', path: 'resignation/cust/claim/list' }, //获取需要认领的客户列表
  { api: 'assignCustomer', path: 'resignation/cust/assign' }, //分配客户
  { api: 'claimCustomer', path: 'resignation/cust/claim' }, //认领客户
  { api: 'assignBatchCustomer', path: 'resignation/cust/batch/assign'}, //批量分配客户
  { api: 'claimBatchCustomer', path: 'resignation/cust/batch/claim'}, //批量认领客户
  { api: 'refuseCustomer', path: 'resignation/cust/refuse'}, //拒绝认领客户
  { api: 'refuseBatchCustomer', path: 'resignation/cust/batch/refuse'}, //批量拒绝认领客户
  { api: 'handoverChain', path: 'resignation/handoverChain'}, //获取离职交接流程表
  
]
arr.forEach((api) => {
  DIMISSION[api.api || api] = (data) => request({
    url: `/crm/${api.path || 'resignation/' + api}`,
    method: 'post',
    data
  })
})
export default DIMISSION
