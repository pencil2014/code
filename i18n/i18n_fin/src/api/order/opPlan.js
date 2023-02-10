import request from '@/utils/request'

// 计划单时间节点 /order/op/plan/checkpoint/list
export function getCheckpointList(data) {
  return request({
    url: '/order/op/plan/checkpoint/list',
    method: 'post',
    data
  })
}

// 计划单服务项 /order/op/plan/service/list
export function getServiceList(data) {
  return request({
    url: '/order/op/plan/service/list',
    method: 'post',
    data
  })
}

// 计划单时间节点保存 /order/op/plan/checkpoint/save
export function checkpointSave(data) {
  return request({
    url: '/order/op/plan/checkpoint/save',
    method: 'post',
    data
  })
}

// 计划单个人备注查询 /order/op/plan/remark/info
export function getRemarkInfo(data) {
  return request({
    url: '/order/op/plan/remark/info',
    method: 'post',
    data
  })
}

// 计划单个人备注修改 /order/op/plan/remark/save
export function saveRemarkInfo (data) {
  return request({
    url: '/order/op/plan/remark/save',
    method: 'post',
    data
  })
}

// 根据港口编号获取港口信息 /base/webapi/port/list/codes
export function getPortListCodes(data) {
  return request({
    url: '/base/webapi/port/list/codes',
    method: 'post',
    data
  })
}

// 计划单待办列表 /order/op/plan/todo/list
export function getPlanTodoList(data) {
  return request({
    url: '/order/op/plan/todo/list',
    method: 'post',
    data
  })
}

// 计划单待办完成 /order/op/plan/todo/finish
export function planTodoFinish(data) {
  return request({
    url: '/order/op/plan/todo/finish',
    method: 'post',
    data
  })
}

// 计划单待办未完成 /order/op/plan/todo/unfinish
export function planTodoUnFinish(data) {
  return request({
    url: '/order/op/plan/todo/unfinish',
    method: 'post',
    data
  })
}

// 增加获取SLA评分结果接口，用于展示评分 /order/sla/result/list
export function getOrderSlaList(data) {
  return request({
    url: '/order/sla/result/list',
    method: 'post',
    data
  })
}

// 增加获取SLA配置接口用于展示评分标准 /order/sla/config/list
export function getOrderSlaConfigList(data) {
  return request({
    url: '/order/sla/config/list',
    method: 'post',
    data
  })
}

// 枚举 /webapi/sla/itemCode
export function getItemCode(data) {
  return request({
    url: '/base/webapi/sla/itemCode',
    method: 'post',
    data
  })
}

// 订阅货物追踪 /order/op/plan/trace/subscribe
export function traceSubscribe(data) {
  return request({
    url: '/order/op/plan/trace/subscribe',
    method: 'post',
    data
  })
}
