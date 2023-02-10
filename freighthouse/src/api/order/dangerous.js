import request from '@/utils/request'

// 危险品申报列表
export function dangerousList(data) {
    return request({
        url: '/order/shipping/dangerous/list',
        method: 'post',
        data
    })
}
// 详情
export function dangerousDetail(data) {
    return request({
        url: '/order/shipping/dangerous/detail',
        method: 'post',
        data
    })
}
// 委托编号
export function dangerousCreateSerialNo(data) {
    return request({
        url: '/order/shipping/dangerous/createSerialNo',
        method: 'post',
        data
    })
}
// 保存
export function dangerousSave(data) {
    return request({
        url: '/order/shipping/dangerous/save',
        method: 'post',
        data
    })
}
// 删除
export function dangerousDelete(data) {
    return request({
        url: '/order/shipping/dangerous/delete',
        method: 'post',
        data
    })
}
// 更新状态
export function dangerousUpdateStatus(data) {
    return request({
        url: '/order/shipping/dangerous/updateStatus',
        method: 'post',
        data
    })
}
// 上传
export function dangerousUploadFile(data) {
    return request({
        url: '/order/shipping/dangerous/uploadFile',
        method: 'post',
        data
    })
}