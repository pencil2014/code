import request from '@/utils/request'

export function getCompanyInvoiceInfo(data) {
  return request({
    url: '/fin/company/getCompanyInvoiceInfo',
    method: 'post',
    data
  })
}

export function listCompanyInvoiceBank(data) {
  return request({
    url: '/fin/company/listCompanyInvoiceBank',
    method: 'post',
    data
  })
}
//获取当前用户可操作结算分公司列表
export function listUserSettleCompany(data) {
  return request({
    url: '/fin/company/listUserSettleCompany',
    method: 'post',
    data
  })
}
