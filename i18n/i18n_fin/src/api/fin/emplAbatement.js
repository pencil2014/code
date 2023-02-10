// 员工提成扣减
import request from '@/utils/request'

/**************************  员工提成扣减  ****************************/
// 员工提成扣减列表
export function emplAbatementList(data) {
  return request({
    url: '/fin/emplAbatement/listPage',
    method: 'post',
    data
  })
}

// 员工提成扣减
export function emplAbatementExtract(data) {
  return request({
    url: '/fin/emplAbatement/extract',
    method: 'post',
    data
  })
}


// 员工提成导出
export function exportEmplAbatement(data) {
  return request({
    url: '/fin/emplAbatement/export',
    method: 'post',
    data
  })
}
