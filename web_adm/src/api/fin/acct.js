// 凭证管理模块
import request from "@/utils/request";

/**************************  凭证设置 列表&新增&编辑  ****************************/
// 会计科目管理列表
export function subjectList(data) {
  return request({
    url: "/fin/acct/subjectList",
    method: "post",
    data
  });
}
// 查询当前科目的父科目
export function getSubjectParent(data) {
  return request({
    url: "/fin/acct/getSubjectParent",
    method: "post",
    data
  });
}
// 新增会计科目管理
export function subjectSave(data) {
  return request({
    url: "/fin/acct/subjectSave",
    method: "post",
    data
  });
}
// 费用项科目管理列表
export function feeItemSubjectList(data) {
  return request({
    url: "/fin/acct/feeItemSubjectList",
    method: "post",
    data
  });
}
// 新增或修改费用项科目
export function feeItemSubjectSave(data) {
  return request({
    url: "/fin/acct/feeItemSubjectSave",
    method: "post",
    data
  });
}
// 凭证字列表
export function voucherClassList(data) {
  return request({
    url: "/fin/acct/voucherClassList",
    method: "post",
    data
  });
}
// 新增凭证字
export function voucherClassSave(data) {
  return request({
    url: "/fin/acct/voucherClassSave",
    method: "post",
    data
  });
}
// 业务子科目列表
export function submatchList(data) {
  return request({
    url: "/fin/acct/submatchList",
    method: "post",
    data
  });
}
// 新增业务子科目
export function submatchSave(data) {
  return request({
    url: "/fin/acct/submatchSave",
    method: "post",
    data
  });
}
// 账簿列表
export function acBookList(data) {
  return request({
    url: "/fin/acct/acBookList",
    method: "post",
    data
  });
}
// 新增账簿
export function acBookSave(data) {
  return request({
    url: "/fin/acct/acBookSave",
    method: "post",
    data
  });
}
// 金蝶账号列表
export function kdAccountList(data) {
  return request({
    url: '/fin/acct/kdAccountList',
    method: 'post',
    data
  })
}
// 场景分组关联账簿列表
export function sceneGroupBookList(data) {
  return request({
    url: "/fin/acct/sceneGroupBookList",
    method: "post",
    data
  });
}
// 保存场景分组关联账簿
export function sceneGroupBookSave(data) {
  return request({
    url: "/fin/acct/sceneGroupBookSave",
    method: "post",
    data
  });
}
// 同步金蝶科目
export function subjectAsync(data) {
  return request({
    url: "/fin/acct/subjectAsync",
    method: "post",
    data
  });
}
/**************************  搜索内列表  ****************************/
// 核算维度列表
export function dimensionList(data) {
  return request({
    url: "/fin/acct/dimensionList",
    method: "post",
    data
  });
}
/**************************  业务凭证设置 | 凭证场景  ****************************/
// 凭证场景查询列表
export function sceneList(data) {
  return request({
    url: "/fin/acct/sceneList",
    method: "post",
    data
  });
}
// 新增凭证场景
export function sceneSave(data) {
  return request({
    url: "/fin/acct/sceneSave",
    method: "post",
    data
  });
}
// 凭证场景分组列表
export function sceneGroupList(data) {
  return request({
    url: "/fin/acct/sceneGroupList",
    method: "post",
    data
  });
}
/**************************  凭证管理  ****************************/
// 凭证管理 列表
export function voucherList(data) {
  return request({
    url: "/fin/voucher/voucherList",
    method: "post",
    data
  });
}
// 搜索凭证列表-汇总金额
export function voucherListSum(data) {
  return request({
    url: '/fin/voucher/voucherListSum',
    method: 'post',
    data
  })
}
// 凭证详情
export function voucherView(data) {
  return request({
    url: "/fin/voucher/voucherView",
    method: "post",
    data
  });
}
// 凭证详情多个
export function voucherViews(data) {
  return request({
    url: '/fin/voucher/voucherViews',
    method: 'post',
    data
  })
}
// 凭证场景分组列表
export function voucherDelete(data) {
  return request({
    url: "/fin/voucher/voucherDelete",
    method: "post",
    data
  });
}
/**************************  科目余额表  ****************************/
// 科目余额表
export function subjectBalanceListPage(data) {
  return request({
    url: "/fin/acBalance/subjectBalanceListPage",
    method: "post",
    data
  });
}

// 科目余额明细表
export function subjectBalanceDetailListPage(data) {
  return request({
    url: "/fin/acBalance/subjectBalanceDetailListPage",
    method: "post",
    data
  });
}

// 核算维度余额表
export function dimensionBalanceListPage(data) {
  return request({
    url: "/fin/acBalance/dimensionBalanceListPage",
    method: "post",
    data
  });
}
// 核算维度明细列表
export function dimensionBalanceDetailListPage(data) {
  return request({
    url: "/fin/acBalance/dimensionBalanceDetailListPage",
    method: "post",
    data
  });
}

// 导出核算维度余额表
export function dimensionBalanceExport(data) {
  return request({
    url: "/fin/acBalance/dimensionBalance/export",
    method: "post",
    data
  });
}
// 导出核算维度明细列表
export function dimensionBalanceDetailExport(data) {
  return request({
    url: "/fin/acBalance/dimensionBalanceDetail/export",
    method: "post",
    data
  });
}

// 导出科目余额表
export function subjectBalanceExport(data) {
  return request({
    url: "/fin/acBalance/subjectBalance/export ",
    method: "post",
    data
  });
}
// 导出科目余额明细表
export function subjectBalanceDetailExport(data) {
  return request({
    url: "/fin/acBalance/subjectBalanceDetail/export",
    method: "post",
    data
  });
}

// 供应商，客户下拉列表
export function kdList(data) {
  return request({
    url: "/fin/settleUnit/kdList",
    method: "post",
    data
  });
}

// 搜索核算维度财务编码
export function searchDimensionFincode(data) {
  return request({
    url: "/fin/acct/searchDimensionFincode",
    method: "post",
    data
  });
}
// 人工新增凭证
export function voucherAdd(data) {
  return request({
    url: "/fin/voucher/voucherAdd",
    method: "post",
    data
  });
}
// 人工凭证获取汇率
export function getKdExchangeRate(data) {
  return request({
    url: "/fin/acct/getKdExchangeRate",
    method: "post",
    data
  });
}
