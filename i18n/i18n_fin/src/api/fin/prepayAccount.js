import request from '@/utils/request'

const PREPAY = {}
let arr = [
  'listPage', // 列表
  'logList',  // 明细列表(详情详情)
  'morePrepayAccountList',  // 更多余额
  'balanceInList',  // 金额列表（详情）
  'balance', //(详情)表头汇总
]
arr.forEach(api => {
  PREPAY[api] = function (data) {
    return request({
      url: `/fin/prepayAccount/${api}`,
      method: 'post',
      data
    })
  }
})
// const COMPANYBANKACCT = {}
// const baseArr = [{
//   // 分公司银行账户信息
//   key: 'companyBankAcct',
//   value: COMPANYBANKACCT,
//   arr: [
//     'pageList',   // 分页查询
//     'save',       // 增加
//     'update',     // 修改
//     'info',       // 详情
//     'enabled',    // 启用/禁用
//   ],
// }, {
//   // 分公司列表
//   key: 'company',
//   value: COMPANY,
//   arr: [
//     'pageList',   // 分页查询
//     'update',     // 修改
//     'info',       // 详情
//   ]
// }]
// baseArr.forEach(item => {
//   item.arr.forEach(api => {
//     item.value[api] = function (data) {
//       return request({
//         url: `/base/webapi/${item.key}/${api}`,
//         method: 'post',
//         data
//       })
//     }
//   })
// })
export default PREPAY