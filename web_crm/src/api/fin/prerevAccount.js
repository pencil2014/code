import request from '@/utils/request'

const PREREV = {}
let arr = [
  'listPage', // 列表
  'logListPage',  // 明细列表(详情详情)
  'morePrerecAccountList',  // 更多余额
  'listReceivablePrerevPage',  // 金额列表（详情）
  'getReceivablePrerevTotal', //(详情)表头汇总
]
arr.forEach(api => {
  PREREV[api] = function (data) {
    return request({
      url: `/fin/prerevAccount/${api}`,
      method: 'post',
      data
    })
  }
})
export default PREREV