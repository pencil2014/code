import request from '@/utils/request'

// 供应商信息模糊查询
export function customerReviewList(data) {
    return request({
        url: '/crm/customer/myVerifyCustomerList',
        method: 'post',
        data
    })
}