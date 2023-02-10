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
          "compareStatus": "",
          "createdBy": 0,
          "createdName": "",
          "createdTime": null,
          "currency": "CNY",
          "expressCorpCode": "SF",
          "expressCorpName": "顺丰速运有限公司",
          "expressNo": "1234569",
          "expressRecordId": 1,
          "ownerCompCode": "000001",
          "ownerCompName": "深圳分公司",
          "revision": 1,
          "settleCompCode": "000001",
          "settleCompName": "深圳分公司",
          "state": "valid",
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

// expressCorpCode	String	快递公司编号
// expressCorpName	String	快递公司名称
// expressNo	String	快递单号
// amt	BigDecimal	金额
// currency	String	币种