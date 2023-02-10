/*
 * @Description: 客情关系接口封装
 * @Autor: yinjunying
 * @Date: 2022-04-12 17:02:35
 */
import request from "@/utils/request";

/**
 * @description: 获取我司联系人列表
 * @param {*} data
 * @return {*}
 * @author: yinjunying
 * @Date: 2022-06-17 15:17:26
 */
export function getOurContactListApi (data) {
  return request({
    url: '/base/webapi/dept/employee/list/all',
    method: 'post',
    data
  })
}


/**
 * @description: 获取客情关系列表接口
 * @param {*}
 * @return {*}
 * @author: yinjunying
 * @Date: 2022-04-12 17:06:16
 */
export function getGuestListApi (data) {
  return request({
    url: '/crm/customerRelation/list',
    method: 'post',
    data
  })
}

/**
 * @description: 标记失效接口
 * @param {*} data
 * @return {*}
 * @author: yinjunying
 * @Date: 2022-04-13 16:16:47
 */
export function markFailureApi (data) {
  return request({
    url: '/crm/customerRelation/invalid',
    method: 'post',
    data
  })
}

/**
 * @description: 新增/编辑客情关系
 * @param {*}
 * @return {*}
 * @author: yinjunying
 * @Date: 2022-04-13 17:57:09
 */
export function addGuestInfoApi (data) {
  return request({
    url: '/crm/customerRelation/add',
    method: 'post',
    data
  })
}

// 客情关系导出
export function exportCustomerRelationApi (data) {
  return request({
    url: '/crm/customerRelation/export',
    method: 'post',
    data
  })
}