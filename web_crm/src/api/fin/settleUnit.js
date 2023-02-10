import request from '@/utils/request'

export function querySettleUnit(data) {
  return request({
    url: '/fin/settleUnit/list',
    method: 'post',
    data
  })
}

export function querySettleUnitByCode(data) {
  return request({
    url: '/fin/settleUnit/getByUnitCode',
    method: 'post',
    data
  })
}



//结算单位银行账号信息查询
export function bankAccountList(data) {
  return request({
    url: '/fin/settleUnit/bankAccountList',
    method: 'post',
    data
  })
}

// 供应商结算单位列表
export function queryFinSupplierList(data) {
  return request({
    url: '/fin/settleUnit/supplierList',
    method: 'post',
    data
  })
}

// crm客商维护人查询
export function getOrgMaintainer(data) {
  return request({
    url: '/fin/settleUnit/getOrgMaintainer',
    method: 'post',
    data
  })
}