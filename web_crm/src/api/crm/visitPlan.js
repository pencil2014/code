import request from '@/utils/request'

const VISITPLAN = {}
// const arr = [
//   'add',  //添加拜访计划
//   'listPage',  //拜访计划列表
//   'export',  //导出拜访计划列表
  
// ]
// arr.forEach((api) => {
//   VISITPLAN[api] = (data) => request({
//     url: `/crm/visitPlan/${api}`,
//     method: 'post',
//     data
//   })
// })
const arr = [
  'saveVisitPlan',
  'planList',
  'deleteRecord',
  'checkVisitPlan',
  'visitPeopleSubmit',//提交审核
  'detailOfSingle',//单个详情,
  'accompanyToVisitPeopleNotarize'//陪访人是否同意
]
arr.forEach((api) => {
  VISITPLAN[api] = (data) => request({
    url: `crm/customer/visit/${api}`,
    method: 'post',
    data
  })
})
export default VISITPLAN