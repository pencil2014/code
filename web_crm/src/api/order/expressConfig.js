import request from '@/utils/request'

// 快递列表 order/default/express/listPage
export function getExpressListPage(data) {
  return request({
    url: '/order/default/express/listPage',
    method: 'post',
    data
  })
}

// 新增 order/default/express/save
export function expressSave(data) {
  return request({
    url: '/order/default/express/save',
    method: 'post',
    data
  })
}

// 批量禁用 order/default/express/invalid
export function expressInvalid(data) {
  return request({
    url: '/order/default/express/invalid',
    method: 'post',
    data
  })
}

// 获取默认快递公司 order/default/express/getDefaultExpress
export function getDefaultExpress(data) {
  return request({
    url: '/order/default/express/getDefaultExpress',
    method: 'post',
    data
  })
}