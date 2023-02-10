import request from '@/utils/request'
// VGM列表
export function vgmList(data) {
  return request({
      url: '/ext/ship/edi/vgm/list',
      method: 'post',
      data
  })
}
// VGM保存
export function vgmSave(data) {
  return request({
      url: '/ext/ship/edi/vgm/cg/original',
      method: 'post',
      data
  })
}
// VGM详情
export function vgmDetail(data) {
  return request({
      url: '/ext/ship/edi/vgm/detail',
      method: 'post',
      data
  })
}