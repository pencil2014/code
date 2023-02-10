import request from "@/utils/request";

let annualPlanShipperApi = {}
let urls = [
  'getColumns', //获取年度计划表头
  'getYearPlanList', //查询年度计划
  'getByPlanId', //获取年度计划详情
  'addYearPlan', //保存年度计划
  'invalidByPlanId', //失效年度计划
  'getAreas', //获取区域信息
  'actualUseTeu' //获取我司实际装载周舱位
]

urls.forEach((api) => {
  annualPlanShipperApi[api] = (data) => {
    let config = {
      url: `/crm/shippingYearPlan/${api}`,
      method: 'post',
      data
    }
    return request(config)
  }
})
export default annualPlanShipperApi

// 获取区域接口封装
export function getAreasListApi(data) {
	return request({
		url: '/crm/shippingYearPlan/getAreas',
		method: 'post',
		data
	})
}