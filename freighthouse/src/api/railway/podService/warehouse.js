import request from '@/utils/request'
// 目的港出仓更新
export function podwhOutUpdate(data) {
  return request({
    url: '/order/podwh/out/update',
    method: 'post',
    data
  })
}
// 一键出仓
export function outBatchSave(data) {
  return request({
    url: '/order/podwh/out/batchSave',
    method: 'post',
    data
  })
}
// 一键入仓
export function inBatchSave(data) {
  return request({
    url: '/order/podwh/in/batchSave',
    method: 'post',
    data
  })
}
// 一键出仓计划
export function outPlanBatchSave(data) {
  return request({
    url: '/order/podwh/outplan/batchSave',
    method: 'post',
    data
  })
}
// 进仓计划获取编号
export function inplanReqno(data) {
  return request({
    url: '/order/podwh/inplan/reqno',
    method: 'post',
    data
  })
}
// 进仓计划保存
export function inplanSave(data) {
  return request({
    url: '/order/podwh/inplan/save',
    method: 'post',
    data
  })
}
// 进仓计划列表
export function inplanList(data) {
  return request({
    url: '/order/podwh/inplan/list',
    method: 'post',
    data
  })
}
// 仓库-进仓信息-目的港进仓计划列表
export function inplanListPage(data) {
  return request({
    url: '/order/podwh/inplan/list/page',
    method: 'post',
    data
  })
}
// 进仓计划详情
export function inplanInfo(data) {
  return request({
    url: '/order/podwh/inplan/info',
    method: 'post',
    data
  })
}
// 进仓计划删除
export function inplanDelete(data) {
  return request({
    url: '/order/podwh/inplan/delete',
    method: 'post',
    data
  })
}
// 实际进仓获取编号
export function inReqno(data) {
  return request({
    url: '/order/podwh/in/reqno',
    method: 'post',
    data
  })
}
//  实际进仓保存
export function inSave(data) {
  return request({
    url: '/order/podwh/in/save',
    method: 'post',
    data
  })
}
//  实际进仓列表
export function inList(data) {
  return request({
    url: '/order/podwh/in/list',
    method: 'post',
    data
  })
}
//  仓库-进仓信息-实际进仓列表
export function inListPage(data) {
  return request({
    url: '/order/podwh/in/list/page',
    method: 'post',
    data
  })
}
//  实际进仓详情
export function inInfo(data) {
  return request({
    url: '/order/podwh/in/info',
    method: 'post',
    data
  })
}
//  实际进仓删除
export function inDelete(data) {
  return request({
    url: '/order/podwh/in/delete',
    method: 'post',
    data
  })
}
//  实际进仓项目明细
export function inItemList(data) {
  return request({
    url: '/order/podwh/in/item/list',
    method: 'post',
    data
  })
}
// 出仓计划编号
export function outplanReqno(data) {
  return request({
    url: '/order/podwh/outplan/reqno',
    method: 'post',
    data
  })
}
// 出仓计划保存
export function outplanSave(data) {
  return request({
    url: '/order/podwh/outplan/save',
    method: 'post',
    data
  })
}
// 出仓计划列表
export function outplanList(data) {
  return request({
    url: '/order/podwh/outplan/list',
    method: 'post',
    data
  })
}
// 仓库-出仓信息-出仓计划列表
export function outplanListPage(data) {
  return request({
    url: '/order/podwh/outplan/list/page',
    method: 'post',
    data
  })
}
// 出仓计划详情
export function outplanInfo(data) {
  return request({
    url: '/order/podwh/outplan/info',
    method: 'post',
    data
  })
}
// 出仓计划删除
export function outplanDelete(data) {
  return request({
    url: '/order/podwh/outplan/delete',
    method: 'post',
    data
  })
}
// 出仓编号
export function outReqno(data) {
  return request({
    url: '/order/podwh/out/reqno',
    method: 'post',
    data
  })
}
// 出仓保存
export function outSave(data) {
  return request({
    url: '/order/podwh/out/save',
    method: 'post',
    data
  })
}
// 出仓列表
export function outList(data) {
  return request({
    url: '/order/podwh/out/list',
    method: 'post',
    data
  })
}
// 仓库-出仓信息-出仓列表
export function outListPage(data) {
  return request({
    url: '/order/podwh/out/list/page',
    method: 'post',
    data
  })
}
// 出仓计划详情
export function outInfo(data) {
  return request({
    url: '/order/podwh/out/info',
    method: 'post',
    data
  })
}
// 出仓计划删除
export function outDelete(data) {
  return request({
    url: '/order/podwh/out/delete',
    method: 'post',
    data
  })
}
// 进仓事项列表
export function matterList(data) {
  return request({
    url: '/order/podwh/matter/list',
    method: 'post',
    data
  })
}
// 进仓事项保存
export function matterSave(data) {
  return request({
    url: '/order/podwh/matter/save',
    method: 'post',
    data
  })
}
// 进仓事项详情
export function matterInfo(data) {
  return request({
    url: '/order/podwh/matter/info',
    method: 'post',
    data
  })
}
// 进仓事项删除
export function matterDelete(data) {
  return request({
    url: '/order/podwh/matter/delete',
    method: 'post',
    data
  })
}
// 进仓事项删除
export function matterStatusChange(data) {
  return request({
    url: '/order/podwh/matter/status/change',
    method: 'post',
    data
  })
}