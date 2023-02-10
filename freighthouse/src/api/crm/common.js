import request from '@/utils/request'

// 获取开户行列表
export function bankList(data) {
    return request({
        url: '/base/webapi/bank/list',
        method: 'post',
        data
    })
}
