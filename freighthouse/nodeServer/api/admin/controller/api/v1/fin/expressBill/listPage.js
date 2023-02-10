module.exports = (params) => {
  return {
    "code": 0,
    "data": {
      "allColumns": [],
      "configColumns": [],
      "currPage": 1,
      "list": [
        {
          "bizDateEnd": "2021-01-31",
          "bizDateStart": "2021-01-01",
          "createdBy": 13,
          "createdName": "许坤才",
          "createdTime": "2021-01-12 16:35:08",
          "expressBillFeeList": [],
          "expressBillId": 4,
          "fileNo": "e74b98bac3914405b67d8aaaf01807be",
          "lastCompareId": 0,
          "parseMode": "",
          "result": "all",
          "revision": 1,
          "settleCompCode": "000001",
          "settleCompName": "深圳分公司",
          "settleOrderNo": "",
          "state": "valid",
          "statementCount": 0,
          "supplierBillNo": "SZKDFZD2101000004",
          "supplierCorpCode": "SF",
          "supplierCorpName": "顺丰速运有限公司",
          "updatedBy": 0,
          "updatedName": "",
          "updatedTime": null
        },
        {
          "bizDateEnd": "2021-01-31",
          "bizDateStart": "2021-01-01",
          "createdBy": 14,
          "createdName": "许坤才2",
          "createdTime": "2021-01-12 16:35:08",
          "expressBillFeeList": [],
          "expressBillId": 4,
          "fileNo": "e74b98bac3914405b67d8aaaf01807be",
          "lastCompareId": 0,
          "parseMode": "",
          "result": "part",
          "revision": 1,
          "settleCompCode": "000001",
          "settleCompName": "深圳分公司",
          "settleOrderNo": "",
          "state": "valid",
          "statementCount": 0,
          "supplierBillNo": "SZKDFZD2101000004",
          "supplierCorpCode": "SF",
          "supplierCorpName": "顺丰速运有限公司",
          "updatedBy": 0,
          "updatedName": "",
          "updatedTime": null
        }
      ],
      "pageSize": 5,
      "totalCount": 4,
      "totalPage": 1
    },
    "msg": "success"
  }
}

// expressBillId	Int	快递账单id
// settleCompCode	String	结算分公司编号
// settleCompName	String	结算分公司名称
// supplierBillNo	String	供应商对账单编号
// supplierCorpCode	String	供应商单位编号
// supplierCorpName	String	供应商单位名称
// parseMode	String	解析模式
// bizDateStart	Date	业务日期开始
// bizDateEnd	Date	业务日期开始
// statementCount	Int	对账次数
// result	String	对账结果
// settleOrderStatus	String	结算单状态
// settleOrderNo	String	结算单编号
// fileNo	Int	导入文件编号
// createdName	String	创建人姓名
// createdTime	Date	创建时间
// updatedName	String	更新人姓名
// updatedTime	Date	更新时间