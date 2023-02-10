import request from '@/utils/request'
// 值班列表
export function dutyList(data) {
  return request({
    url: '/base/webapi/employee/duty/list',
    method: 'post',
    data
  })
}
// 值班保存
export function dutySave(data) {
  return request({
    url: '/base/webapi/employee/duty/save',
    method: 'post',
    data
  })
}
// 值班编辑
export function dutyEdit(data) {
  return request({
    url: '/base/webapi/employee/duty/edit',
    method: 'post',
    data
  })
}
// 值班删除
export function dutyDelete(data) {
  return request({
    url: '/base/webapi/employee/duty/delete',
    method: 'post',
    data
  })
}
// 获取管理的部门列表
export function dutyDeptList(data) {
  return request({
    url: '/base/webapi/employee/manage/dept/list',
    method: 'post',
    data
  })
}
// 获取管理的部门列表
export function dutyIndexList(data) {
  return request({
    url: '/base/webapi/employee/duty/list/index',
    method: 'post',
    data
  })
}
