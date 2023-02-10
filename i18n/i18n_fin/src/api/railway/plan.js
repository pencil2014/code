import request from '@/utils/request'

// 计划单列表
export function planList(data) {
  return request({
    url: '/order/plan/list',
    method: 'post',
    data
  })
}
// 计划单细项状态变更
export function planStatusUpdate(data) {
  return request({
    url: '/order/plan/status/update',
    method: 'post',
    data
  })
}
// 待办事项列表
export function todoList(data) {
  return request({
    url: '/order/todo/list',
    method: 'post',
    data
  })
}
// 待办事项创建
export function todoCreate(data) {
  return request({
    url: '/order/todo/create',
    method: 'post',
    data
  })
}
// 获取所有的事项CODE
export function todoMatterList(data) {
  return request({
    url: '/order/todo/matter/list',
    method: 'post',
    data
  })
}
// 关注的待办事项项目
export function todoFollowList(data) {
  return request({
    url: '/order/todo/follow/list',
    method: 'post',
    data
  })
}
// 关注的待办事项保存
export function todoFollowSave(data) {
  return request({
    url: '/order/todo/follow/save',
    method: 'post',
    data
  })
}
// 自定义待办删除
export function todoDelete(data) {
  return request({
    url: '/order/todo/delete',
    method: 'post',
    data
  })
}
// 自定义待办完结
export function todoClose(data) {
  return request({
    url: '/order/todo/close',
    method: 'post',
    data
  })
}
// 自定义待办编辑
export function todoEdit(data) {
  return request({
    url: '/order/todo/edit',
    method: 'post',
    data
  })
}
