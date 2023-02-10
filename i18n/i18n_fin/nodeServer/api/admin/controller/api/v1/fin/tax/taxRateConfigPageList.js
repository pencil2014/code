module.exports = (params) => {
  return {
    "code": 0,
    "data": {
      "allColumns": [],
      "configColumns": [],
      "currPage": 1,
      "list": [
        {
          "configName": "测试1",
          "configType": "fee_type",
          "createdName": "卓一航1",
          "createdTime": "2021-01-05 18:04:39",
          "enabled": "no",
          "feeServiceCodes": [
            "YWZDF"
          ],
          "level": 1,
          "receipayType": "pay",
          "revision": 1,
          "ruleTypes": [
            "commonfee"
          ],
          "state": "valid",
          "taxRate": 16.00,
          "taxRateConfigId": 2,
          "updatedName": "卓一航1",
          "updatedTime": "2021-01-05 18:08:54"
        },
        {
          "configName": "测试4",
          "configType": "fee_type",
          "createdName": "卓一航",
          "createdTime": "2021-01-05 18:04:39",
          "enabled": "yes",
          "feeServiceCodes": [
            "YWZDF"
          ],
          "level": 1,
          "receipayType": "pay",
          "revision": 1,
          "ruleTypes": [
            "commonfee"
          ],
          "state": "valid",
          "taxRate": 16.00,
          "taxRateConfigId": 2,
          "updatedName": "卓一航",
          "updatedTime": "2021-01-05 18:08:54"
        }
      ],
      "pageSize": 10,
      "totalCount": 1,
      "totalPage": 1
    },
    "msg": "success"
  }
}

// taxRateConfigId	yes	int	税率配置id
// configName	yes	string	税率配置名称
// receipayType	yes	string	收付类型
// revision	yes	int	数据版本号
// configType	yes	string	规则配置类型，fee_type-费用类型、service_type-服务类型
// ruleTypes	yes	Array	规则项类型集合，字符串数组,通过configType值获取
// feeServiceCodes	yes	Array	费用项类型集合，字符串数组；通过ruleTypes值获取
// level	yes	int	规则优先级
// taxRate	yes	number	税率
// enabled	yes	string	是否有效 yes-有效；no-失效
// createdName	yes	string	创建人
// createdTime	yes	string	创建时间
// updatedName	no	string	修改人
// updatedTime	no	string	修改时间