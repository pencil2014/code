import request from '@/utils/request'

const ATTACH = {}
const arr = [
  /**************** 客户 ****************/
  { api: 'customerList', path: 'attachment/customer/list' }, //列表
  // 'customerUpload',//上传附件
  { api: 'customerUpload', headers: { 'Content-Type': 'multipart/form-data', } },//上传附件
  'customerDelete',//删除
  /**************** 供应商 ****************/
  { api: 'supplierList', path: 'attachment/supplier/list' }, //列表
  // 'supplierUpload',//上传附件
  { api: 'supplierUpload', headers: { 'Content-Type': 'multipart/form-data', } },//上传附件
  'supplierDelete',//删除
  /**************** 基本信息 ****************/
  // 'attachmentUpload',//上传附件
  { api: 'attachmentUpload', headers: { 'Content-Type': 'multipart/form-data', } },//上传附件
  'supplierDelete',//删除附件
  /**************** 船司 ****************/
  { api: 'shippingCarrierList', path: 'attachment/shippingCarrier/list' }, //列表
  // 海外同行获取交接资料
  {api: 'customerOverseas',  path: 'attachment/customerOverseas/list' }
]
arr.forEach((api) => {
  ATTACH[api.api || api] = (data) => request({
    url: `/crm/${api.path || ('attachment/' + (api.api || api))}`,
    method: 'post',
    data,
    headers: api.headers || {}
  })
})
export default ATTACH