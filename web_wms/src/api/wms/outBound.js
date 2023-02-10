import request from '@/utils/request'

// 获取出库列表数据
export function queryPageList (data) {
  return request({
    url: '/wms/outBound/queryPageList',
    method: 'post',
    data
  })
}

// 新增出库单
export function saveOutBound (data) {
  return request({
    url: '/wms/outBound/save',
    method: 'post',
    data
  })
}

// 修改出库单
export function updateOutBound (data) {
  return request({
    url: '/wms/outBound/update',
    method: 'post',
    data
  })
}

// 删除出库单
export function deleteOutBound (data) {
  return request({
    url: '/wms/outBound/delete',
    method: 'post',
    data
  })
}

// 出库单详情
export function queryOutBoundDetail (data) {
  return request({
    url: '/wms/outBound/queryDetail',
    method: 'post',
    data
  })
}

// 出库单操作
export function operateOutBound (data) {
  return request({
    url: '/wms/outBound/operate',
    method: 'post',
    data
  })
}

// 获取车辆信息
export function queryTruckInfo (data) {
  return request({
    url: '/wms/truck/queryTruckInfo',
    method: 'post',
    data
  })
}


// 耗材使用新增/删除
export function updateConsumable (data) {
  return request({
    url: '/wms/outBound/outBoundConsumable',
    method: 'post',
    data
  })
}

// 查询客户自带辅材
export function queryCustSelf (data) {
  return request({
    url: '/wms/consumableInventory/queryCustSelf',
    method: 'post',
    data
  })
}

// 上传装货货照片
export function uploadPic (data) {
  return request({
    url: '/wms/outBound/uploadPic',
    method: 'post',
    data
  })
}

// 费用保存
export function saveOutboundFee (data) {
  return request({
    url: '/wms/base/feeOperate',
    method: 'post',
    data
  })
}

// 查询利润
export function getOrderProfit (data) {
  return request({
    url: '/wms/base/getOrderProfit',
    method: 'post',
    data
  })
}

// 获取费用列表
export function getFeeList(data) {
  return request({
    url: '/wms/base/queryFeeList',
    method: 'post',
    data
  })
}

// 结算单详情
export function generateSettleOrder(data) {
  return request({
    url: '/wms/base/generateSettleOrder',
    method: 'post',
    data
  })
}

// 结算单新增
export function settleOrderAdd(data) {
  return request({
    url: '/wms/base/settleOrderAdd',
    method: 'post',
    data
  })
}

// 费用项列表
export function feeItemList(name, state) {
  state = state || ''
	let size = 20
  return request({
    url: '/wms/base/feeItemList',
    method: 'post',
    data: { name, state, size }
  })
}

// 结算单位列表
export function querySettleUnit(data) {
  return request({
    url: '/wms/base/querySettleUnit',
    method: 'post',
    data: data.isAdd ? data : { ...data, containHistoryUnitName: 'yes' }
  })
}

// 获取出库耗材
export function outBoundConsumableQuery(data) {
  return request({
    url: '/wms/outBound/outBoundConsumableQuery',
    method: 'post',
    data
  })
}

// 是否异地查询接口
export function queryOffsite(data) {
  return request({
    url: '/wms/outBound/queryOffsite',
    method: 'post',
    data
  })
}

// 获取堆场码头下拉框信息
export function queryPageForOutbound(data) {
  return request({
    url: '/wms/wharfYard/queryPageForOutbound',
    method: 'post',
    data
  })
}