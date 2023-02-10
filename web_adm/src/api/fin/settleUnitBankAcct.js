import request from '@/utils/request'

// 查询所有有效的银行账号信息
export function queryAllBankAccountList(data) {
  return request({
    url: '/fin/settleUnitBankAcct/bankAccountList',
    method: 'post',
    data
  })
}
//分公司
export function companyBankAccountList(data) {
  return request({
    url: '/fin/settleUnitBankAcct/companyBankAccountList',
    method: 'post',
    data
  })
}
//银行账户列表
export function bankAccountListAll(data) {
  return request({
    url: '/fin/settleUnitBankAcct/bankAccountListAll',
    method: 'post',
    data
  })
}
//银行账户列表
export function listReceivableRegAccount(data) {
  return request({
    url: '/fin/settleUnitBankAcct/listReceivableRegAccount',
    method: 'post',
    data
  })
}
//用于账单和对账单，当前用户所属分公司的银行账户和深圳分公司的银行账号
export function companyBillBankAccountList(data) {
  return request({
    url: '/fin/settleUnitBankAcct/companyBillBankAccountList',
    method: 'post',
    data
  })
}