module.exports = (params) => {
  return {
    "code": 0,
    "data": {
      "taxRateConfigId": 1,
      "configName": "税率配置名称",
      "receipayType": "收付类型",
      "configType": "规则配置类型",
      "revision": 1,
      "ruleTypes": [
        "规则项类型集合"
      ],
      "feeServiceCodes": [
        "费用项类型集合"
      ],
      "level": 1,
      "taxRate": 16,
      "enabled": "yes"
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