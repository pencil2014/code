import request from '@/utils/request'

const ACCOUNT = {}
const arr = [
  /**************** 客户 ****************/
  { api: 'customerList', path: 'orgBankAccount/customer/accountList' }, //列表
  'customerInvalid',//失效
  'customerAdd',//新增
  'customerUpdate',//更新
  /**************** 供应商 ****************/
  { api: 'supplierList', path: 'orgBankAccount/supplier/accountList' }, //列表
  'supplierInvalid',//失效
  'supplierAdd',//新增
  'supplierUpdate',//更新
  'listAll', //账户列表
  'verifyAccount', //验证账号是否存在
    /**************** 船司 ****************/
  { api: 'shippingCarrierList', path: 'orgBankAccount/shippingCarrier/accountList' }, //列表
  'shippingCarrierInvalid',//失效
  'shippingCarrierAdd',//新增 
  'shippingCarrierUpdate',//更新
]
arr.forEach((api) => {
  ACCOUNT[api.api || api] = (data) => request({
    url: `/crm/${api.path || 'orgBankAccount/' + api}`,
    method: 'post',
    data
  })
})
export default ACCOUNT
