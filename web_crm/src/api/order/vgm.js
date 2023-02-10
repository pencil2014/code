import request from '@/utils/request'

// VGM申报列表
export function vgmList(data) {
    return request({
        url: '/order/shipping/vgm/list',
        method: 'post',
        data
    })
}
// VGM申报保存
export function vgmSave(data) {
    return request({
        url: '/order/shipping/vgm/save',
        method: 'post',
        data
    })
}
// VGM申报删除
export function vgmDelete(data) {
    return request({
        url: '/order/shipping/vgm/delete',
        method: 'post',
        data
    })
}
// VGM申报状态修改
export function vgmUpdateStatus(data) {
    return request({
        url: '/order/shipping/vgm/updateStatus',
        method: 'post',
        data
    })
}
// VGM申报状态修改v20220701
export function vgmUpdateStatusByContainer(data) {
    return request({
        url: '/order/shipping/vgm/updateStatus/bycontainer',
        method: 'post',
        data
    })
}