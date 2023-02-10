import request from "@/utils/request"
// 客户合同列表
export function contractList(data) {
  return request({
    url: "/crm/custContract/list",
    method: "post",
    data,
  })
}
// 客户合同保存
export function contractSave(data) {
  return request({
    url: "/crm/custContract/save",
    method: "post",
    data,
  })
}
// 客户合同详情
export function contractDetail(data) {
  return request({
    url: "/crm/custContract/detail",
    method: "post",
    data,
  })
}
// 客户合同失效
export function contractInvalid(data) {
  return request({
    url: "/crm/custContract/invalid",
    method: "post",
    data,
  })
}

// 客户信控列表
export function creditAccountList(data) {
  return request({
    url: "/crm/creditAccount/list",
    method: "post",
    data,
  })
}
// 客户信控保存
export function creditAccountSave(data) {
  return request({
    url: "/crm/creditAccount/save",
    method: "post",
    data,
  })
}
// 客户信控失效
export function creditAccountInvalid(data) {
  return request({
    url: "/crm/creditAccount/invalid",
    method: "post",
    data,
  })
}
// 客户信控详情
export function creditAccountDetail(data) {
  return request({
    url: "/crm/creditAccount/detail",
    method: "post",
    data,
  })
}

// 客户结算列表
export function custSettleList(data) {
  return request({
    url: "/crm/custSettle/list",
    method: "post",
    data,
  })
}
// 客户结算保存
export function custSettleSave(data) {
  return request({
    url: "/crm/custSettle/save",
    method: "post",
    data,
  })
}
// 客户结算失效
export function custSettleInvalid(data) {
  return request({
    url: "/crm/custSettle/invalid",
    method: "post",
    data,
  })
}
// 客户结算详情
export function custSettleDetail(data) {
  return request({
    url: "/crm/custSettle/detail",
    method: "post",
    data,
  })
}

// 获取客户合同编号
export function getContractNos(data) {
  return request({
    url: "/crm/custContract/getContractNos",
    method: "post",
    data,
  })
}
// 获取供应商合同编号
export function getSupContractNos(data) {
  return request({
    url: "/crm/supplier/contract/generateContractNo",
    method: "post",
    data,
  })
}
// 上传合同附件
export function saveAttachments(data) {
  return request({
    url: "/crm/custContract/saveAttachments",
    method: "post",
    data,
  })
}
// 生成合同编号
export function generateContractNo(data) {
  return request({
    url: "/crm/custContract/generateContractNo",
    method: "post",
    data,
  })
}
// 客户结算关联公司
export function relation(data) {
  return request({
    url: "/crm/customer/relCust",
    method: "post",
    data,
  })
}
