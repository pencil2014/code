import request from "@/utils/request";

let annualPlanApi = {}
let urls = [
  'addYearlyPlan', //新增/编辑年度计划
  'queryYearlyPlanListByCustId', //客户页列表查询
  'deleteYearlyPlan', //删除年度计划
  'queryYearlyPlan', //获取年度计划详情
  'verifyYearlyPlan', //审核年度计划
  'queryYearlyPlanList', //获取所有年度计划
  'export', //导出年度计划
  'userInfo', //年度计划角色查询
  'exportSpecificCustomers' // 年度计划导出数据
]

urls.forEach((api) => {
  annualPlanApi[api] = (data) => {
    let config = {
      url: `/crm/yearlyPlan/${api}`,
      method: 'post',
      data
    }
    return request(config)
  }
})
export default annualPlanApi