import request from '@/utils/request'
const API = {}
let arr = [
  'listPage', //快递费对账分页列表
  'importBill', //快递费账单导入
  'info', //快递费账单数据
  'detail', //快递费账单数据(含费用明细)
  'deleteExpressBillFee', //快递费账单费用删除
  'listExpressBillFeePage', //供应商账单费用列表分页
  'listCompanyFeePage', //公司寄单费用列表分页
  'getCompareDetail', //快递账单对账结果详情
  'listExpressBillFeeCompareLogPage', //供应商账单费用对账明细列表
  'listCompanyFeeCompareLogPage', //公司寄单费用对账明细列表
  'confirm', //对账详情费用确认
  'createSettleOrder', //对账单生成结算单
  'getCompanyFeeTotal', //公司寄单费用汇总查询
  'compare', //对账
  'listCompareLogPage',
]
arr.forEach(item => {
  API[item] = (data) => request({
    url: `/fin/expressBill/${item}`,
    method: 'post',
    data
  })
})
API['confirm'] = (data) => request({
  url: `/fin/expressBill/confirm`,
  method: 'post',
  data,
  timeout: 180 * 1000
})
//获取快递分摊费用
API.getExpressAllotFee = (data) => request({
  url: `/fin/express/getExpressAllotFee`,
  method: 'post',
  data
})
//下载模板
API.templateDownload = () => request({
  url: `/fin/expressBill/templateDownload`,
  method: 'get',
  params: {},
  headers: {
    'filename': 'utf-8',
    'content-disposition': 'attachment;filename=total.xls',
    'content-type': 'application/x-download;charset=utf-8'
  },
  responseType: 'blob'
})

export default API