import request from '@/utils/request'

// 提单纸列表 order/blPaper/listPage
export function getBlPagerList(data) {
  return request({
    url: `/order/blPaper/listPage`,
    method: 'post',
    data
  })
}

// 统计提单纸状态 order/blPaper/countPaperStatus
export function getBlPagerCountPaperStatus(data) {
  return request({
    url: `/order/blPaper/countPaperStatus`,
    method: 'post',
    data
  })
}

// 新增提单纸 order/blPaper/batchSave
export function blPagerBatchSave(data) {
  return request({
    url: `/order/blPaper/batchSave`,
    method: 'post',
    data
  })
}

// 提单纸详情 order/blPaper/info
export function blPagerInfo(data) {
  return request({
    url: `/order/blPaper/info`,
    method: 'post',
    data
  })
}

// 提单纸列表导出 order/blPaper/export
export function blPaperExport(data) {
  return request({
    url: `/order/blPaper/export`,
    method: 'post',
    data
  })
}

// 修改提单纸信息 order/blPaper/update
export function blPagerUpdate(data) {
  return request({
    url: `/order/blPaper/update`,
    method: 'post',
    data
  })
}

// 提单纸作废 order/blPaper/invalid
export function blPagerInvalid(data) {
  return request({
    url: `/order/blPaper/invalid`,
    method: 'post',
    data
  })
}

// 上传作废附件 order/blFile/uploadInvalidFile
export function  uploadInvalidFile(data) {
  return request({
    url: `/order/blFile/uploadInvalidFile`,
    method: 'post',
    data
  })
}

// 提单纸转移记录列表 order/blPaperTransfer/listPage
export function blPagerTransferListPage(data) {
  return request({
    url: `/order/blPaperTransfer/listPage`,
    method: 'post',
    data
  })
}

// 申请提单纸 order/blPaperTransfer/applyPaper
export function blPagerTransferApply(data) {
  return request({
    url: `/order/blPaperTransfer/applyPaper`,
    method: 'post',
    data
  })
}

// 转移 order/blPaperTransfer/transfer
export function blPagerTransfer(data) {
  return request({
    url: `/order/blPaperTransfer/transfer`,
    method: 'post',
    data
  })
}

// 拒绝 order/blPaperTransfer/reject
export function blPagerTransferReject(data) {
  return request({
    url: `/order/blPaperTransfer/reject`,
    method: 'post',
    data
  })
}

// 撤回 order/blPaperTransfer/cancel
export function blPagerTransferCancel(data) {
  return request({
    url: `/order/blPaperTransfer/cancel`,
    method: 'post',
    data
  })
}

// 完成 order/blPaperTransfer/finish
export function blPagerTransferFinish(data) {
  return request({
    url: `/order/blPaperTransfer/finish`,
    method: 'post',
    data
  })
}