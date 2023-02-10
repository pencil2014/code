// 凭证管理模块
import request from '@/utils/request'

/**************************  凭证设置 列表&新增&编辑  ****************************/
// 会计科目管理列表
export function subjectList(data) {
  return request({
    url: '/fin/acct/subjectList',
    method: 'post',
    data
  })
}
// 查询当前科目的父科目
export function getSubjectParent(data) {
  return request({
    url: '/fin/acct/getSubjectParent',
    method: 'post',
    data
  })
}
// 新增会计科目管理
export function subjectSave(data) {
  return request({
    url: '/fin/acct/subjectSave',
    method: 'post',
    data
  })
}
// 费用项科目管理列表
export function feeItemSubjectList(data) {
  return request({
    url: '/fin/acct/feeItemSubjectList',
    method: 'post',
    data
  })
}
// 新增或修改费用项科目
export function feeItemSubjectSave(data) {
  return request({
    url: '/fin/acct/feeItemSubjectSave',
    method: 'post',
    data
  })
}
// 凭证字列表
export function voucherClassList(data) {
  return request({
    url: '/fin/acct/voucherClassList',
    method: 'post',
    data
  })
}
// 新增凭证字
export function voucherClassSave(data) {
  return request({
    url: '/fin/acct/voucherClassSave',
    method: 'post',
    data
  })
}
// 业务子科目列表
export function submatchList(data) {
  return request({
    url: '/fin/acct/submatchList',
    method: 'post',
    data
  })
}
// 新增业务子科目
export function submatchSave(data) {
  return request({
    url: '/fin/acct/submatchSave',
    method: 'post',
    data
  })
}
// 账簿列表
export function acBookList(data) {
  return request({
    url: '/fin/acct/acBookList',
    method: 'post',
    data
  })
}
// 新增账簿
export function acBookSave(data) {
  return request({
    url: '/fin/acct/acBookSave',
    method: 'post',
    data
  })
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
    url: '/fin/acct/sceneGroupBookList',
    method: 'post',
    data
  })
}
// 保存场景分组关联账簿
export function sceneGroupBookSave(data) {
  return request({
    url: '/fin/acct/sceneGroupBookSave',
    method: 'post',
    data
  })
}
// 同步金蝶科目
export function subjectAsync(data) {
  return request({
    url: '/fin/acct/subjectAsync',
    method: 'post',
    data
  })
}
/**************************  搜索内列表  ****************************/
// 核算维度列表
export function dimensionList(data) {
  return request({
    url: '/fin/acct/dimensionList',
    method: 'post',
    data
  })
}
/**************************  业务凭证设置 | 凭证场景  ****************************/
// 凭证场景查询列表
export function sceneList(data) {
  return request({
    url: '/fin/acct/sceneList',
    method: 'post',
    data
  })
}
// 新增凭证场景
export function sceneSave(data) {
  return request({
    url: '/fin/acct/sceneSave',
    method: 'post',
    data
  })
}
// 新增凭证场景
export function sceneDelete(data) {
  return request({
    url: '/fin/acct/sceneDelete',
    method: 'post',
    data
  })
}
// 凭证场景分组列表
export function sceneGroupList(data) {
  return request({
    url: '/fin/acct/sceneGroupList',
    method: 'post',
    data
  })
}
/**************************  凭证管理  ****************************/
// 凭证管理 列表
export function voucherList(data) {
  return request({
    url: '/fin/voucher/voucherList',
    method: 'post',
    data
  })
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
    url: '/fin/voucher/voucherView',
    method: 'post',
    data
  })
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
    url: '/fin/voucher/voucherDelete',
    method: 'post',
    data
  })
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

// export function kdAccountList(data) {
//   return request({
//     url: '/fin/acct/kdAccountList',
//     method: 'post',
//     data
//   })
// }
// 金蝶编码列表
export function kingdeeCodeList(data) {
  return request({
    url: '/fin/voucher/kingdeeCodeList',
    method: 'post',
    data
  })
}
// 金蝶编码保存
export function kingdeeCodeSave(data) {
  return request({
    url: '/fin/voucher/kingdeeCodeSave',
    method: 'post',
    data
  })
}
// 账套列表
export function acAccountList(data) {
  return request({
    url: '/fin/acct/acAccountList',
    method: 'post',
    data
  })
}
export function acAccountSave(data) {
  return request({
    url: '/fin/acct/acAccountSave',
    method: 'post',
    data
  })
}
// 金蝶汇率列表
export function acRateList(data) {
  return request({
    url: '/fin/acRate/listPage',
    method: 'post',
    data
  })
}
// 金蝶编码保存
export function acRateSync(data) {
  return request({
    url: '/fin/acRate/syncRate',
    method: 'post',
    data
  })
}
// 金蝶编码保存
export function acbookAsync(data) {
  return request({
    url: '/fin/acct/acbookAsync',
    method: 'post',
    data
  })
}


/***************************************  外账 beigin  *****************************************/
/***************************************  外账 beigin  *****************************************/
/***************************************  外账 beigin  *****************************************/
/***************************************  外账 beigin  *****************************************/
/***************************************  外账 beigin  *****************************************/
/***************************************  外账 beigin  *****************************************/
// 会计凭证列表接口
export function exVoucherList(data) {
  return request({ url: '/fin/exVoucher/exVoucherList', method: 'post', data })
}
// 会计凭证列表接口汇总
export function exVoucherListSum(data) {
  return request({ url: '/fin/exVoucher/exVoucherListSum', method: 'post', data })
}
// 外账-订单预关账成功列表
export function exOrderPreclosingList(data) {
  return request({ url: '/fin/exFinClose/exOrderPreclosingList', method: 'post', data })
}
// 外账-订单预关帐生成转字凭证
export function exOrderPrecloseGenerateVoucher(data) {
  return request({ url: '/fin/exFinClose/exOrderPrecloseGenerateVoucher', method: 'post', data })
}

// 外账-订单转字费用详情
export function exOrderPreclosingFees (data) {
  return request({
    url: `/fin/exFinClose/exOrderPreclosingFees`,
    method: 'post',
    data
  })
}
// 外账-发票转字列表
export function exInvoicePreclosingList (data) {
  return request({
    url: `/fin/exFinClose/exInvoicePreclosingList`,
    method: 'post',
    data
  })
}
// 外账-发票转字凭证预览与生成
export function exInvoicePrecloseGenerateVoucher (data) {
  return request({
    url: `/fin/exFinClose/exInvoicePrecloseGenerateVoucher`,
    method: 'post',
    data
  })
}
// 外账-发票转字费用详情
export function exInvoicePreclosingFees(data) {
  return request({
    url: `/fin/exFinClose/exInvoicePreclosingFees`,
    method: 'post',
    data
  })
}
// 外账-发票转字 人工启动转字凭证生成
export function manualStartOrderInvoiceShiftVoucher(data) {
  return request({
    url: `/fin/exFinClose/manualStartOrderInvoiceShiftVoucher`,
    method: 'post',
    data
  })
}
// TODO 待确定接口
// 外账-凭证详情
export function exVoucherView(data) {
  return request({
    url: '/fin/exVoucher/exVoucherView',
    method: 'post',
    data
  })
}
export function exVoucherViews(data) {
  return request({
    url: '/fin/exVoucher/exVoucherViews',
    method: 'post',
    data
  })
}