import request from '@/utils/request'

// 代理报检委托信息列表
export function inspectionList(data) {
  return request({
    url: '/order/shipping/inspection/list',
    method: 'post',
    data
  })
}

// 获取代理报检委托编号
export function inspectionGetIntrustNo(data) {
  return request({
    url: '/order/shipping/inspection/getIntrustNo',
    method: 'post',
    data
  })
}

// 新增代理报检委托信息
export function inspectionSave(data) {
  return request({
    url: '/order/shipping/inspection/save',
    method: 'post',
    data
  })
}

// 代理报检委托信息状态修改
export function inspectionUpdateStatus(data) {
  return request({
    url: '/order/shipping/inspection/updateStatus',
    method: 'post',
    data
  })
}

// 代理报检委托信息删除
export function inspectionDelete(data) {
  return request({
    url: '/order/shipping/inspection/delete',
    method: 'post',
    data
  })
}

// 代理报检详情
export function inspectionDetail(data) {
  return request({
    url: '/order/shipping/inspection/detail',
    method: 'post',
    data
  })
}

// 代理报检委托信息附件列表
export function inspectionFileList(data) {
  return request({
    url: '/order/shipping/inspection/fileList',
    method: 'post',
    data
  })
}

// 代理报检委托信息删除附件
export function inspectionDeleteFile(data) {
  return request({
    url: '/order/shipping/inspection/deleteFile',
    method: 'post',
    data
  })
}

// 附件类型列表
export function inspectionAttachmentList(data) {
  return request({
    url: '/order/shipping/inspection/attachmentList',
    method: 'post',
    data
  })
}