module.exports = (params) => {
  return {
    "code": 0,
    "data": {
      "allColumns": [
      ],
      "configColumns": [
      ],
      "currPage": 1,
      "list": [
        {
          "businsessTypes": [
            "ship_export_fcl",
            "ship_export_lcl"
          ],
          "currency": "USD",
          "feeCode": "ZCPXF",
          "revision": 1,
          "feeEnName": "Loading and assembling costs",
          "feeName": "装车拼箱费",
          "feeUnit": "bill",
          "finGroup": "special",
          "needPaired": "no",
          "profitType": "no",
          "receipayGroup": "pay",
          "createdBy": 4,
          "createdName": "赵斌",
          "createdTime": "2020-09-21 10:01:42",
          "updatedBy": 4,
          "updatedName": "赵斌",
          "updatedTime": "2020-09-21 10:05:01",
          "mergeFeeCode": "",
          "mergeFeeName": "",
          "serviceCodes": [
            "book",
            "pol_inspection",
            "fume"
          ],
          "enabled": "yes"
        },
        {
          "businsessTypes": [
            "ship_export_fcl",
            "ship_export_lcl"
          ],
          "currency": "USD",
          "feeCode": "ZCPXF",
          "revision": 12,
          "feeEnName": "Loading and assembling costs",
          "feeName": "装车拼箱费2",
          "feeUnit": "bill",
          "finGroup": "special",
          "needPaired": "no",
          "profitType": "no",
          "receipayGroup": "pay",
          "createdBy": 4,
          "createdName": "赵斌2",
          "createdTime": "2020-09-21 10:01:42",
          "updatedBy": 4,
          "updatedName": "赵斌2",
          "updatedTime": "2020-09-21 10:05:01",
          "mergeFeeCode": "",
          "mergeFeeName": "",
          "serviceCodes": [
            "book",
            "pol_inspection",
            "fume"
          ],
          "enabled": "yes"
        }
      ],
      "pageSize": 10,
      "totalCount": 1,
      "totalPage": 1
    },
    "msg": "success"
  }
}



// feeCode	Y	Int	费用编码
// feeName	Y	String	中文名
// feeEnName	Y	String	英文名
// finGroup	Y	String	财务分组
// receipayGroup	Y	String	收付类型
// currency	Y	String	默认币别
// feeUnit	Y	String	计费单位
// needPaired	Y	String	是否应收应收同时录入
// profitType	Y	String	是否参与利润计算
// revision	Y	int	数据版本号
// businsessTypes	yes	Array	业务类型 业务类型编码集合
// serviceCodes	yes	Array	服务模块编码集合
// mergeFeeCode	yes	string	合并显示费用代码
// mergeFeeName	yes	string	合并显示费用名称
// enabled	yes	string	是否启用 yes-启用；no-不启用