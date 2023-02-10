import request from '@/utils/request'

// 获取入库列表数据
export function queryPageList (data) {
  return request({
    url: '/wms/inBound/queryPageList',
    method: 'post',
    data
  })
}
// 获取入库单信息详情
export function queryInboundDetail (data) {
  return request({
    url: '/wms/inBound/queryInboundDetail',
    method: 'post',
    data
  })
}
// 新增入库单信息
export function saveInboundOrderInfo (data) {
  return request({
    url: '/wms/inBound/saveInboundOrderInfo',
    method: 'post',
    data
  })
}

// 修改入库单信息
export function updateInBoundOrderInfo (data) {
  return request({
    url: '/wms/inBound/updateInBoundOrderInfo',
    method: 'post',
    data
  })
}

// 获取客户列表数据
export function getCustomerList (data) {
  return request({
    url: '/wms/base/customerList',
    method: 'post',
    data
  })
}

// 删除派工
export function removeWorkTeam (data) {
  return request({
    url: '/wms/workDispatch/removeByOrder',
    method: 'post',
    data
  })
}

// 确认收货/撤销收货
export function inBoundOperate (data) {
  return request({
    url: '/wms/inBound/operate',
    method: 'post',
    data
  })
}

// 新增客户自带辅材
export function saveCustSelf (data) {
  return request({
    url: '/wms/consumableInventory/saveCustSelf',
    method: 'post',
    data
  })
}

// 上传卸货照片
export function uploadPic (data) {
  return request({
    url: '/wms/inBound/uploadPic',
    method: 'post',
    data
  })
}

// 入库单删除
export function deleteInBoundOrder (data) {
  return request({
    url: '/wms/inBound/deleteInBoundOrderInfo',
    method: 'post',
    data
  })
}

// 打印入库单
export function printInBoundOrder (data) {
  return request({
    url: '/wms/inBound/print',
    method: 'post',
    data
  })
}

// 货物明细接口
export function queryGoodsDetail (data) {
  return request({
    url: '/wms/inBound/queryGoodsDetail',
    method: 'post',
    data
  })
}

// 客户自带辅材的查询
export function queryInBoundConsumable (data) {
  return request({
    url: '/wms/inBound/queryInBoundConsumable',
    method: 'post',
    data
  })
}
