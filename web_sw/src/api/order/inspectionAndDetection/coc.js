import request from '@/utils/request'

// COC/SOSA委托信息列表
export function cocList(data) {
  return request({
    url: '/order/shipping/coc/list',
    method: 'post',
    data
  })
}

// 获取COC/SOSA委托编号
export function cocGetIntrustNo(data) {
  let {orderNo} = data
  return request({
    url: '/order/shipping/coc/getIntrustNo?orderNo=' + orderNo,
    method: 'post',
    data:{}
  })
}

// 新增COC/SOSA委托信息
export function cocSave(data) {
  return request({
    url: '/order/shipping/coc/save',
    method: 'post',
    data
  })
}

// COC/SOSA委托信息状态修改
export function cocUpdateStatus(data) {
  return request({
    url: '/order/shipping/coc/updateStatus',
    method: 'post',
    data
  })
}

// COC/SOSA委托信息删除
export function cocDelete(data) {
  return request({
    url: '/order/shipping/coc/delete',
    method: 'post',
    data
  })
}

// COC/SOSA详情
export function cocDetail(data) {
  return request({
    url: '/order/shipping/coc/detail',
    method: 'post',
    data
  })
}

// COC/SOSA委托信息附件列表
export function cocFileList(data) {
  return request({
    url: '/order/shipping/coc/fileList',
    method: 'post',
    data
  })
}

// COC/SOSA委托信息删除附件
export function cocDeleteFile(data) {
  return request({
    url: '/order/shipping/coc/deleteFile',
    method: 'post',
    data
  })
}

// COC/SOSA委托选择附件
export function cocSelectFile(data) {
  return request({
    url: '/order/shipping/coc/selectFile',
    method: 'post',
    data
  })
}