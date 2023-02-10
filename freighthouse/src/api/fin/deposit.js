// 押金模块
import request from '@/utils/request'

/**************************  押金管理  ****************************/
// 押金申请列表
export let depositApplyList = (data) => request({ url: '/fin/depositApply/listPage', method: 'post', data })
// 押金申请列表汇总
export let getListAmtSummary = (data) => request({ url: '/fin/depositApply/getListAmtSummary', method: 'post', data })
// 押金详情
export let depositApplyInfo = (data) => request({ url: '/fin/depositApply/info', method: 'post', data })
// 押金申请
export let depositApply = (data) => request({ url: '/fin/depositApply/depositApply', method: 'post', data })
// 获取押金类型设置
export let getDepositType = (data) => request({ url: '/fin/depositApply/getDepositType', method: 'post', data })
// 押金撤回申请
export let depositApplyRevoke = (data) => request({ url: '/fin/depositApply/revoke', method: 'post', data })
// 押金申请审批
export let depositApplyAudit = (data) => request({ url: '/fin/depositApply/audit', method: 'post', data })
// 押金条开具/收取
export let recvDepositFile = (data) => request({ url: '/fin/depositApply/recvDepositFile', method: 'post', data })
// 押金条退回/收回
export let backDepositFile = (data) => request({ url: '/fin/depositApply/backDepositFile', method: 'post', data })
// 押金费用列表
export let listDepositFeePage = (data) => request({ url: '/fin/depositApply/listDepositFeePage', method: 'post', data })
// 押金费用列表金额汇总
export let getDepositFeeListAmtSummary = (data) => request({ url: '/fin/depositApply/getDepositFeeListAmtSummary', method: 'post', data })