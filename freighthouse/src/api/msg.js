import request from '@/utils/request'
//消息发送
export function noticeWebsiteSend(data) {
  return request({
    url: '/msg/notice/website/send',
    method: 'post',
    data
  })
}
//更新日志修改
export function noticeWebsiteUpdate(data) {
  return request({
    url: '/msg/notice/website/update',
    method: 'post',
    data
  })
}
//定时启用停用
export function noticeDelayEnableOrStop(data) {
  return request({
    url: '/msg/poll/template/enableOrStop',
    method: 'post',
    data
  })
}
//定时详情
export function noticeDelayDetail(data) {
  return request({
    url: '/msg/poll/template/detail',
    method: 'post',
    data
  })
}
//定时删除
export function noticeDelayDelete(data) {
  return request({
    url: '/msg/poll/template/delete',
    method: 'post',
    data
  })
}
//定时编辑
export function noticeDelayEdit(data) {
  return request({
    url: '/msg/poll/template/edit',
    method: 'post',
    data
  })
}
//定时新增
export function noticeDelayAdd(data) {
  return request({
    url: '/msg/poll/template/add',
    method: 'post',
    data
  })
}
//定时列表
export function noticeDelayList(data) {
  return request({
    url: '/msg/poll/template/list',
    method: 'post',
    data
  })
}
//触发删除
export function noticeTriggerDelete(data) {
  return request({
    url: '/msg/event/template/delete',
    method: 'post',
    data
  })
}
//触发编辑
export function noticeTriggerEdit(data) {
  return request({
    url: '/msg/event/template/edit',
    method: 'post',
    data
  })
}
//触发新增
export function noticeTriggerAdd(data) {
  return request({
    url: '/msg/event/template/add',
    method: 'post',
    data
  })
}
//触发列表
export function noticeTriggerList(data) {
  return request({
    url: '/msg/event/template/list',
    method: 'post',
    data
  })
}
//事件删除
export function noticeEventsDelete(data) {
  return request({
    url: '/msg/event/delete',
    method: 'post',
    data
  })
}
//事件编辑
export function noticeEventsEdit(data) {
  return request({
    url: '/msg/event/edit',
    method: 'post',
    data
  })
}
//事件新增
export function noticeEventsAdd(data) {
  return request({
    url: '/msg/event/add',
    method: 'post',
    data
  })
}
//事件列表
export function noticeEventsList(data) {
  return request({
    url: '/msg/event/list',
    method: 'post',
    data
  })
}
//分组参数
export function noticeParamGroups(data) {
  return request({
    url: '/msg/param/groups',
    method: 'post',
    data
  })
}
//模板删除
export function noticeTemplateDelete(data) {
  return request({
    url: '/msg/template/delete',
    method: 'post',
    data
  })
}
//模板编辑
export function noticeTemplateEdit(data) {
  return request({
    url: '/msg/template/edit',
    method: 'post',
    data
  })
}
//模板新增
export function noticeTemplateAdd(data) {
  return request({
    url: '/msg/template/add',
    method: 'post',
    data
  })
}
//模板列表
export function noticeTemplateList(data) {
  return request({
    url: '/msg/template/list',
    method: 'post',
    data
  })
}


//参数删除
export function noticeParamDelete(data) {
  return request({
    url: '/msg/param/delete',
    method: 'post',
    data
  })
}
//参数编辑
export function noticeParamEdit(data) {
  return request({
    url: '/msg/param/edit',
    method: 'post',
    data
  })
}
//参数新增
export function noticeParamAdd(data) {
  return request({
    url: '/msg/param/add',
    method: 'post',
    data
  })
}
//参数列表
export function noticeParamList(data) {
  return request({
    url: '/msg/param/list',
    method: 'post',
    data
  })
}
//批量已读
export function noticeWebsiteRead(data) {
  return request({
    url: '/msg/notice/website/read',
    method: 'post',
    data
  })
}
//批量删除
export function noticeWebsiteDelete(data) {
  return request({
    url: '/msg/notice/website/delete',
    method: 'post',
    data
  })
}
export function noticeWebsiteList(data) {
  return request({
    url: '/msg/notice/website/list',
    method: 'post',
    data
  })
}
export function noticeMsgUpgrade(data) {
  return request({
    url: '/msg/notice/website/msgUpgrade',
    method: 'post',
    data
  })
}
