import request from '@/utils/request'

const BLACK = {}
const arr = [
  'customerList',  //客户列表
  'customerSearch',  //黑名单导入搜索客户列表
  'supplierSearch',  //黑名单导入搜索供应商列表
  'customerExport',  //客户列表导出
  'customerAdd', //客户黑名单添加
  'customerRelease', //客户黑名单解除
  'customerRelationRecord', //判断所要拉黑的企业是否有关联公司
  'noMaintenanceRelease',//黑名单解除(无维护)
  // 'supplierImport', //客户黑名单导入
  { api: 'supplierImport', headers: { 'Content-Type': 'multipart/form-data', } },
  'supplierList',  //供应商列表
  'supplierExport',  //供应商列表导出
  'supplierAdd', //供应商黑名单添加
  'supplierRelease', //供应商黑名单解除
  'supplierRelationRecord', //判断所要拉黑的供应商是否有关联公司
  // 'customerImport', //客户黑名单导入
  { api: 'customerImport', headers: { 'Content-Type': 'multipart/form-data', } },
  { api: 'download', path: 'file/temp/download', method: 'get' }, //黑名单导入模板
  'allowFee', //黑名单录费用
]
arr.forEach((api) => {
  BLACK[api.api || api] = (data, params = {}, cfg) => {
    let config = {
      // url: `/crm/${api.path || ('blacklist/' + (api.api || api))}`,
      url: `/crm/blacklist/${api.path || api.api || api}`,
      method: api.method || 'post',
      data,
      params,
      headers: api.headers || {},
    }
    if (cfg) config.responseType = cfg.responseType
    return request(config)
  }
})
export default BLACK
