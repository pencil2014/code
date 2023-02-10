import request from '@/utils/request'

const CONTACT = {}
const arr = [
  /**************** 客户 ****************/
  { api: 'customerList', path: 'orgContact/customer/list' }, //客户联系人信息
  { api: 'customerVisitList', path: 'orgContact/customerVisit/list'}, //客户联系人信息manager也有权限，上面那个主管信息
  'customerInvalid',//客户联系人失效
  'addCustomerContact',//新增客户联系人
  'editCustomerContact',//编辑联系人
  /**************** 供应商 ****************/
  { api: 'supplierList', path: 'orgContact/supplier/list' }, //供应商联系人信息
  'supplierInvalid',//供应商联系人失效
  'addSupplierContact',//新增供应商联系人
  /**************** 船司 ****************/
  { api: 'shippingCarrierList', path: 'orgContact/shippingCarrier/list' }, //供应商联系人信息
  'shippingCarrierInvalid',//客户联系人失效
  'addShippingCarrierContact',//新增船司联系人
]
arr.forEach((api) => {
  CONTACT[api.api || api] = (data) => request({
    url: `/crm/${api.path || 'orgContact/' + api}`,
    method: 'post',
    data
  })
})
export default CONTACT
