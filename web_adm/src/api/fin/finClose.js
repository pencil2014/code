// 凭证管理模块
import request from '@/utils/request'

let arr = [
  'precloseApplyAudit',   // 预关账申请审批
  'failPreclosingList',   // 获取当前预关账失败列表
  'precloseApply',        // 发起预关账申请
  'precloseApplyList',    // 预关账申请列表
  'preclose',             // 手动预关账
  'precloseApplyLog',     // 预关账申请日志
  'close',                // 总关账
  'closeList',            // 总关账列表
  'preclosingList',       // 预关账成功列表 
  'forcePreclose',        // 强制预关帐
  'precloseGenerateVoucher',  // 预关帐生成转字凭证
  'precloseByCloseRecord',  // 按预关账失败记录手动预关账
  'finClosingStat',  // 总关账汇总界面
  'deptFinClosingFailList',  // 部门总关账失败订单列表
  'recheckFinClosing',  // 重新检查总关账校验
  'precloseByBill', // 按订单手动预关账
  'preclosingPreviewList', // 获取订单预关账预览列表
  'mngPrecloseByBill', // 预关账失败列表=》强制预关账
  'precloseApplyCancel', // 负利润预关账申请撤回
  'precloseDelay', // 登记未预关账原因
  'modifyPrecloseDelay', // 修改未关账原因
]
let API = {}
arr.forEach(item => {
  API[item] = function (data) {
    return request({
      url: `/fin/finClose/${item}`,
      method: 'post',
      data
    })
  }
});
// 获取财务日期
API['getSysDate'] = function (data) {
  return request({
    url: `/fin/sysDate/getSysDate`,
    method: 'post',
    data
  })
};
// 获取财务日期列表
API['sysDateList'] = function (data) {
  return request({
    url: `/fin/sysDate/sysDateList`,
    method: 'post',
    data
  })
};
// 修改财务日期
API['sysDateSave'] = function (data) {
  return request({
    url: `/fin/sysDate/sysDateSave`,
    method: 'post',
    data
  })
};
// /fin/sysDate/getSysDate
export default API