import request from "@/utils/request";

let slaApi = {}
let apiInfo = [
  { api: 'getItemCode', path: '/base/webapi/sla/itemCode ' }, //获取评分项目/服务项信息
  { api: 'getException', path: '/base/webapi/sla/exception/list' }, //获取异常管理信息
  { api: 'list', path: '/crm/qualityControl/list' }, //质量管控列表
  { api: 'addOrUpdate', path: '/crm/qualityControl/addOrUpdate'  }, //保存质量管控
  { api: 'verify', path: '/crm/qualityControl/verify' }, //提交审核
  { api: 'refuse', path: '/crm/qualityControl/verify/refuse' }, //审核拒绝
  { api: 'pass', path: '/crm/qualityControl/verify/pass' } //审核通过
]

apiInfo.forEach((api) => {
  slaApi[api.api || api] = (data) => {
    let config = {
      url: api.path,
      method: 'post',
      data
    }
    return request(config)
  }
})
export default slaApi