module.exports = (params) => {
  return {
    "code": 0,
    "data": {
      "allColumns": [],
      "configColumns": [],
      "currPage": 1,
      "list": [
        {
          "amt": 30.00,
          "createdBy": 13,
          "createdName": "许坤才",
          "createdTime": "2021-01-12 15:59:25",
          "currency": "CNY",
          "expressBillFeeId": 1,
          "expressBillId": 1,
          "expressNo": "123456",
          "revision": 0,
          "settleCompCode": "",
          "settleCompName": "",
          "state": "valid",
          "supplierBillNo": "SZKDFZD2101000001",
          "supplierCorpCode": "SF",
          "supplierCorpName": "顺丰速运有限公司",
          "updatedBy": 0,
          "updatedName": "",
          "updatedTime": null
        }
      ],
      "pageSize": 5,
      "totalCount": 1,
      "totalPage": 1
    },
    "msg": "success"
  }
}

// supplierCorpCode	String	供应商单位编号
// supplierCorpName	String	供应商单位名称
// expressNo	String	快递单号
// amt	BigDecimal	金额
// currency	String	币种