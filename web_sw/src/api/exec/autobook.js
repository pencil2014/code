//autobook接口调用模块
import request from '@/utils/request'

/************************** 自动订舱相关接口  ****************************/
//配置列表
export function configureList(data) {
  return request({
    url: '/bkg/configure/list',
    method: 'post',
    data
  })
}

//配置列表
export function configureSave(data) {
  return request({
    url: '/bkg/configure/addOrUpdate',
    method: 'post',
    data
  })
}

//配置列表
export function configureDelete(data) {
  return request({
    url: '/bkg/configure/delete',
    method: 'post',
    data
  })
}

//cosco任务列表
export function coscoTaskList(data) {
  return request({
    url: '/bkg/coscoTask/list',
    method: 'post',
    data
  })
}
//oocl任务列表
export function ooclTaskList(data) {
  return request({
    url: '/bkg/ooclTask/list',
    method: 'post',
    data
  })
}

//cosco任务列表
export function coscoTaskSave(data) {
  return request({
    url: '/bkg/coscoTask/addOrUpdate',
    method: 'post',
    data
  })
}
//oocl任务列表
export function ooclTaskSave(data) {
  return request({
    url: '/bkg/ooclTask/addOrUpdate',
    method: 'post',
    data
  })
}

//cosco任务删除
export function coscoTaskDelete(data) {
  return request({
    url: '/bkg/coscoTask/delete',
    method: 'post',
    data
  })
}



//消息通知
export function msgNoticeList(data) {
  return request({
    url: '/bkg/msgNotice/list',
    method: 'post',
    data
  })
}


//消息重发
export function msgResend(data) {
  return request({
    url: '/bkg/msgNotice/resend',
    method: 'post',
    data
  })
}

