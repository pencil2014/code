import request from '@/utils/request'

const INVOICE = {}
const arr = [
  /**************** 客户 ****************/
  'customerInfo',//信息
  'customerAdd',//新增
  'customer/setDefault',//客户设置默认开票银行
  /**************** 供应商 ****************/
  'supplierInfo',//信息
  'supplierAdd',//新增
  'supplier/setDefault',//供应商设置默认开票银行
    /**************** 船司 ****************/
  'shippingCarrierInfo',//信息
  'shippingCarrierAdd',//新增
  'shippingCarrier/setDefault',//船司设置默认开票银行
]
arr.forEach((api) => {
  INVOICE[api] = (data) => request({
    url: `crm/invoice/${api}`,
    method: 'post',
    data
  })
})
export default INVOICE
