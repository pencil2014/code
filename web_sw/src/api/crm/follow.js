import request from "@/utils/request";
//客户跟进记录
export function pageList(data) {
  return request({
    url: "/crm/custCommunication/pageList",
    method: "post",
    data,
  });
}
//客户跟进记录详情
export function detail(data) {
  return request({
    url: "/crm/custCommunication/detail",
    method: "post",
    data,
  });
}
//新增或者更新客户拜访跟进记录
export function addOrUpdateVisit(data) {
  return request({
    url: "/crm/custCommunication/addOrUpdateVisit",
    method: "post",
    data,
  });
}
//新增或者更新客户电话QQ微信跟进记录
export function addOrUpdateNet(data) {
  return request({
    url: "/crm/custCommunication/addOrUpdateNet",
    method: "post",
    data,
  });
}
//新增或者更新客户询价跟进记录录
export function addOrUpdateInquiry(data) {
  return request({
    url: "/crm/custCommunication/addOrUpdateInquiry",
    method: "post",
    data,
  });
}
// 全部客户跟进记录
export function allPageList(data) {
  return request({
    url: "/crm/custCommunication/all/pageList",
    method: "post",
    data,
  });
}
// 客户跟进记录导出
export function exportPageList(data) {
  return request({
    // url: "/crm/custCommunication/all/pageList/export",
    url: "/crm/customer/communication/list/export",
    method: "post",
    data,
  });
}

// 销售助理查找销售
export function searchBd(data) {
  return request({
    url: "/crm/customer/searchBd",
    method: "post",
    data,
  });
}

// 批量检查跟进记录
export function batchCheck(data) {
  return request({
    url: "/crm/custCommunication/batchCheck",
    method: "post",
    data,
  });
}

// 跟进记录
export function detailList(data) {
  return request({
    url: "/crm/customer/communication/detail/list",
    method: "post",
    data,
  });
}
// 跟进记录关联拜访计划列表
export function detailRelationList(data) {
  return request({
    url: "/crm/customer/communication/detailRelationList",
    method: "post",
    data,
  });
}
// 跟进记录检查
export function followCheck(data) {
  return request({
    url: "/crm/customer/communication/batchCheck",
    method: "post",
    data,
  });
}
// 新增或者更新客户询价跟进记录
export function saveInquiry(data) {
  return request({
    url: "/crm/customer/communication/saveInquiry",
    method: "post",
    data,
  });
}
// 新增或者更新客户拜访跟进记录
export function saveVisit(data) {
  return request({
    url: "/crm/customer/communication/saveVisit",
    method: "post",
    data,
  });
}
// 新增或者更新客户拜访跟进记录 海外同行
export function saveFPVisit(data) {
  return request({
    url: "/crm/customer/communication/saveForeignVisit",
    method: "post",
    data,
  });
}

// 全部跟进记录列表
export function allList(data) {
  return request({
    url: "/crm/customer/communication/list",
    method: "post",
    data,
  });
}

// 全部跟进记录列表
export function allListDetail(data) {
  return request({
    url: "/crm/customer/communication/detail",
    method: "post",
    data,
  });
}

// 跟进记录删除
export function deleteDetail(data) {
  return request({
    url: "/crm/customer/communication/delete",
    method: "post",
    data,
  });
}

// 历史主要需求
export function demandsList(data) {
  return request({
    url: "/crm/customer/communication/queryCommunicationHistory",
    method: "post",
    data,
  });
}

// 跟进记录日志列表
export function followLogList(data) {
  return request({
    url: "/crm/orgOpLog/communication/list",
    method: "post",
    data,
  });
}