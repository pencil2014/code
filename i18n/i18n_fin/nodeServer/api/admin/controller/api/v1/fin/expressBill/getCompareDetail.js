module.exports = (params) => {
  return {
    "code": 0,
    "data": {
      "bizDateEnd": "2021-01-31",
      "bizDateStart": "2021-01-01",
      "companyFeeAmount": 1,
      "companyFeeTotalAmt": {
        "CNY": 30.00
      },
      "createdBy": 13,
      "createdName": "许坤才",
      "createdTime": "2021-01-18 11:40:23",
      "expressCompareId": 2,
      "matchRemark": "[]",
      "matchResult": "part",
      "parseMode": "",
      "settleCompCode": "000001",
      "settleCompName": "深圳分公司",
      "state": "valid",
      "supplierBillNo": "SZKDFZD2101000001",
      "supplierCorpCode": "SF",
      "supplierCorpName": "顺丰速运有限公司",
      "supplierFeeAmount": 1,
      "supplierFeeTotalAmt": {
        "CNY": 30.00
      },
      "updatedBy": 0,
      "updatedName": "",
      "updatedTime": null
    },
    "msg": "success"
  }
}

// expressCompareId	Int	快递账单对账id
// settleCompCode	String	结算分公司编号
// settleCompName	String	结算分公司名称
// supplierBillNo	String	供应商对账单编号
// supplierCorpCode	String	供应商单位编号
// supplierCorpName	String	供应商单位名称
// parseMode	String	解析模式
// bizDateStart	Date	业务日期开始
// bizDateEnd	Date	业务日期开始
// matchResult	String	对账结果
// matchRemark	String	对账备注
// createdName	String	创建人姓名
// createdTime	Date	创建时间
// updatedName	String	更新人姓名
// updatedTime	Date	更新时间
// supplierFeeAmount	Int	费用条数
// supplierFeeTotalAmt	Map	费用总金额 格式{“CNY”: 30.00，”USD”: 30.00}
// companyFeeAmount	Int	费用条数
// companyFeeTotalAmt	Map	费用总金额 格式{“CNY”: 30.00，”USD”: 30.00}