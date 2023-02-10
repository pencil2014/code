import request from '@/utils/request'

// 账户列表
export function listAll(data) {
  return request({
    url: '/crm/orgBankAccount/listAll',
    method: 'post',
    data
  })
}
// 结算信息页面，更新客户帐单
export function updateAccount(data) {
  return request({
    url: '/fin/fiscalterm/refreshCustFiscalTerm',
    method: 'post',
    data
  })
}

