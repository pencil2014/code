import request from '@/utils/request'

// 账户列表
export function listAll(data) {
  return request({
    url: '/crm/orgBankAccount/listAll',
    method: 'post',
    data
  })
}
