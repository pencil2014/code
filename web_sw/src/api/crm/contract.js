import request from "@/utils/request";

//客户结算信息
export function custSettleList(data) {
  return request({
    url: "/crm/custSettle/info/list",
    method: "post",
    data,
  });
}
// 新增或者更新客户结算信息
export function addOrUpdate(data) {
  return request({
    url: "/crm/custSettle/info/addOrUpdate",
    method: "post",
    data,
  });
}
// 设置客户结算信息有效状态
export function setSettleStatus(data) {
  return request({
    url: "/crm/custSettle/info/setStatus",
    method: "post",
    data,
  });
}
// 设置客户合同信息有效状态
export function setContractStatus(data) {
  return request({
    url: "/crm/custContract/setStatus",
    method: "post",
    data,
  });
}
// 客户合同信息列表
export function custContractList(data) {
  return request({
    url: "/crm/custContract/list",
    method: "post",
    data,
  });
}
// 新增或者更新客户合同信息
export function contractAddOrUpdate(data) {
  return request({
    url: "/crm/custContract/addOrUpdate",
    method: "post",
    data,
  });
}
// 信控信息列表
export function creditAccountList(data) {
  return request({
    url: "/crm/creditAccount/list",
    method: "post",
    data,
  });
}
// 信控修改内部额度
export function updateInnerQuota(data) {
  return request({
    url: "/crm/creditAccount/updateInnerQuota",
    method: "post",
    data,
  });
}
// 客户结算关联公司
export function relation(data) {
  return request({
    url: "/crm/custStruct/settle/relation",
    method: "post",
    data,
  });
}
// 获取合同编号
export function getContractNos(data) {
  return request({
    url: "/crm/custContract/getContractNos",
    method: "post",
    data,
  });
}
// 上传合同附件
export function saveAttachments(data) {
  return request({
    url: "/crm/custContract/saveAttachments",
    method: "post",
    data,
  });
}
// 获取客户合同信息详情
export function custContractDetail(data) {
  return request({
    url: "/crm/custContract/detail",
    method: "post",
    data,
  });
}
// 查看授信额度详情
export function creditDetail(data) {
  return request({
    url: "/crm/custContract/creditDetail",
    method: "post",
    data,
  });
}
// 查看结算信息详情
export function settleInfo(data) {
  return request({
    url: "/crm/custContract/settleInfo",
    method: "post",
    data,
  });
}
// 生成合同编号
export function generateContractNo(data) {
  return request({
    url: "/crm/custContract/generateContractNo",
    method: "post",
    data,
  });
}
// 根据业务类型查询系统航线
export function dictListByBusiness(data) {
  return request({
    url: "/base/webapi/systemLine/dictListByBusiness",
    method: "post",
    data,
  });
}
/**
 *
 * 供应商合同接口
 *
 */
// 合同列表
export function supContractList(data) {
  return request({
    url: "crm/supplier/contract/list",
    method: "post",
    data,
  });
}
// 保存合同
export function supContractSave(data) {
  return request({
    url: "crm/supplier/contract/save",
    method: "post",
    data,
  });
}
// 合同详情
export function supContractDetail(data) {
  return request({
    url: "crm/supplier/contract/detail",
    method: "post",
    data,
  });
}
// 失效合同
export function supContractInvalid(data) {
  return request({
    url: "crm/supplier/contract/invalid",
    method: "post",
    data,
  });
}
// 查询合同列表
export function getContractList(data) {
  return request({
    url: "crm/custContract/all/list",
    method: "post",
    data,
  });
}
// 查询船司合同列表
export function shipcContractList(data) {
  return request({
    url: "crm/shippingCarrier/contract/list",
    method: "post",
    data,
  });
}
// 失效船司合同
export function shipcContractInvalid(data) {
  return request({
    url: "crm/shippingCarrier/contract/invalid",
    method: "post",
    data,
  });
}
