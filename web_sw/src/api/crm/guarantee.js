import request from "@/utils/request"

//保函信息列表
export function list(data) {
  return request({
    url: "/crm/custGuarantee/list",
    method: "post",
    data,
  })
}
// 获取保函信息详情
export function detail(data) {
  return request({
    url: "/crm/custGuarantee/detail",
    method: "post",
    data,
  })
}
// 新增或者更新保函信息
export function addOrUpdate(data) {
  return request({
    url: "/crm/custGuarantee/addOrUpdate",
    method: "post",
    data,
  })
}
// 设置保函信息有效状态
export function setStatus(data) {
  return request({
    url: "/crm/custGuarantee/setStatus",
    method: "post",
    data,
  })
}
// 保管人
export function listByRoleDept(data) {
  return request({
    url: "/base/webapi/role/employees/listByRoleDept",
    method: "post",
    data,
  })
}
// 保函归属人信息列表
export function belong(data) {
  return request({
    url: "/crm/custGuarantee/belong",
    method: "post",
    data,
  })
}
// 保函编号
export function getGuaranteeNo(data) {
  return request({
    url: "/crm/custGuarantee/getGuaranteeNo",
    method: "post",
    data,
  })
}
