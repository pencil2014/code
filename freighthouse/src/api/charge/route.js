import request from '@/utils/request'

//查询列表
export function routeList(data) {
  return request({
    url: '/charge/route/list',
    method: 'post',
    data
  })
}
//驳船查询列表
export function feederRouteList(data) {
  return request({
    url: '/charge/route/feederList',
    method: 'post',
    data
  })
}
//列表详情
export function routeInfo(data) {
  return request({
    url: '/charge/route/info',
    method: 'post',
    data
  })
}
//订单船期查询
export function sailingDateInfo(data) {
  return request({
    url: '/charge/route/sailingDateInfo',
    method: 'post',
    data
  })
}
//查询列表-大掌柜数据
export function dzgRouteList(data) {
  return request({
    url: '/order/charge/dzg/list',
    method: 'post',
    data
  })
}
//订单新建-大掌柜船开时间查询
export function dzgShipTime(data) {
  return request({
    url: '/order/charge/dzg/ship/time',
    method: 'post',
    data
  })
}
//查询列表-大掌柜数据
export function dzgPgList(data) {
  return request({
    url: '/order/charge/dzg/pg/list',
    method: 'post',
    data
  })
}
//查询列表-大掌柜数据-明细
export function dzgPgDetail(data) {
  // casenumber
  return request({
    url: '/order/charge/dzg/pg/detail',
    method: 'post',
    data
  })
}
//查询列表-大掌柜数据-展开加载
export function dzgPgSonList(data) {
  // foldCasenumbers
  return request({
    url: '/order/charge/dzg/pg/son/list',
    method: 'post',
    data
  })
}
//查询列表-大掌柜数据-附加费
export function dzgPgFeeList(data) {
  // casenumbers
  return request({
    url: '/order/charge/dzg/pg/fee/list',
    method: 'post',
    data
  })
}
//查询列表-大掌柜数据-船期
export function dzgPgDataList(data) {
  // casenumbers
  return request({
    url: '/order/charge/dzg/pg/date/list',
    method: 'post',
    data
  })
}