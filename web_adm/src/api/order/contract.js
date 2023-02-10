import request from '@/utils/request'
// 合约号列表导出
export function contractListExport(data) {
  return request({
    url: '/order/contract/contract/list/export',
    method: 'post',
    data
  })
}
// 合约关闭
export function contractClose(data) {
  return request({
    url: '/order/contract/contract/close',
    method: 'post',
    data
  })
}
// 审批组织机构数据
export function approvalOrgList(data) {
	return request({
		url: '/base/webapi/approval/org/list',
		method: 'post',
		data
	})
}
// 审批人列表
export function approvalEmployeeList(data) {
	return request({
		url: '/base/webapi/approval/employee/list',
		method: 'post',
		data
	})
}
// 审批人保存
export function approvalEmployeeAdd(data) {
	return request({
		url: '/base/webapi/approval/employee/add',
		method: 'post',
		data
	})
}
// 审批人编辑
export function approvalEmployeeEdit(data) {
	return request({
		url: '/base/webapi/approval/employee/edit',
		method: 'post',
		data
	})
}
// 审批人删除
export function approvalEmployeeDelete(data) {
	return request({
		url: '/base/webapi/approval/employee/delete',
		method: 'post',
		data
	})
}
// 审批处理
export function flowStatusChange(data) {
	return request({
		url: '/order/contract/flow/status/change',
		method: 'post',
		data
	})
}
// 按订单号查询模板信息
export function bookTempInfo(data) {
	return request({
		url: '/order/shiporder/spacebook/temp/info',
		method: 'post',
		data
	})
}
// 商务另存为模板
export function bookTempSave(data) {
	return request({
		url: '/order/shiporder/spacebook/temp/save',
		method: 'post',
		data
	})
}
// 商务另存模板删除
export function bookTempDelete(data) {
	return request({
		url: '/order/shiporder/spacebook/temp/delete',
		method: 'post',
		data
	})
}
// 商务自定义模板列表（含空白）
export function bookTempList(data) {
	return request({
		url: '/order/shiporder/spacebook/temp/list',
		method: 'post',
		data
	})
}
// 根据小合约号ID获取详情
export function contractTempInfo(data) {
	return request({
		url: '/order/contract/contract/temp/info',
		method: 'post',
		data
	})
}
// 商务可选择的合约列表
export function contractUseList(data) {
	return request({
		url: '/order/contract/contract/use/list',
		method: 'post',
		data
	})
}
// 日志
export function contractLogList(data) {
  return request({
    url: '/order/contract/contract/log/list',
    method: 'post',
    data
  })
}
// 合约列表
export function contractList(data) {
  return request({
    url: '/order/contract/contract/list',
    method: 'post',
    data
  })
}
// 合约保存(编辑)
export function contractSave(data) {
  return request({
    url: '/order/contract/contract/save',
    method: 'post',
    data
  })
}
// 合约申请
export function contractApply(data) {
  return request({
    url: '/order/contract/contract/apply',
    method: 'post',
    data
  })
}
// 合约详情
export function contractInfo(data) {
  return request({
    url: '/order/contract/contract/info',
    method: 'post',
    data
  })
}
// 子合约保存
export function contractItemSave(data) {
  return request({
    url: '/order/contract/contract/item/save',
    method: 'post',
    data
  })
}
// 子合约删除
export function contractItemDelete(data) {
  return request({
    url: '/order/contract/contract/item/delete',
    method: 'post',
    data
  })
}
// 模板保存
export function contractTempSave(data) {
  return request({
    url: '/order/contract/contract/temp/save',
    method: 'post',
    data
  })
}
// 维护人保存
export function contractKeepSave(data) {
  return request({
    url: '/order/contract/contract/keep/save',
    method: 'post',
    data
  })
}
// 维护人删除
export function contractKeepDelete(data) {
  return request({
    url: '/order/contract/contract/keep/delete',
    method: 'post',
    data
  })
}
// 抬头列表
export function contractTitleList(data) {
  return request({
    url: '/order/contract/title/list',
    method: 'post',
    data
  })
}
// 抬头保存(编辑)
export function contractTitleSave(data) {
  return request({
    url: '/order/contract/title/save',
    method: 'post',
    data
  })
}
// 抬头删除
export function contractTitleDelete(data) {
  return request({
    url: '/order/contract/title/delete',
    method: 'post',
    data
  })
}
// 抬头详情
export function contractTitleInfo(data) {
  return request({
    url: '/order/contract/title/info',
    method: 'post',
    data
  })
}
// 抬头失效
export function contractTitleInvalid(data) {
  return request({
    url: '/order/contract/title/invalid',
    method: 'post',
    data
  })
}