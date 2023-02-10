module.exports = (params) => {
  return {
    "code": 0,
    "data": {
      "pageSize": 5,
      "totalCount": 4,
      "totalPage": 1,
      list: [{
        "expressCompareId": 1,
        "expressNo": 1,
        "feeCurrency": 'CNY',
        "feeAmt": 1,
        "matchResult": 'yes',
      }, {
        "expressCompareId": 1,
        "expressNo": 2,
        "feeCurrency": 'CNY',
        "feeAmt": 2,
        "matchResult": 'yes',
      }]
    },
    "msg": "success"
  }
}

// expressCompareId	int	对账id
// supplierExpressNo	String	快递单号
// supplierFeeCurrency	string	货币
// supplierFeeAmt	BigDecimal	金额
// matchResult	String	是否匹配