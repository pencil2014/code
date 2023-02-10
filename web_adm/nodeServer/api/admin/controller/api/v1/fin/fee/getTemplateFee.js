module.exports = (params) => {
  return {
    "code": 0,
    "data": [
      {
      "settleCorpCode":"结算单位编码",
       "serviceCode":"服务项编码",
       "feeCode":"费用编码",
       "receipayType":"pay",
       "prepayType":"prepay",
       "feeAmt":0,
       "feeUnit":"UNIT",
       "unitPrice":0.00,
       "unitCount":1,
       "currency":"USD",
       "remark":"备注说明"
      },
      {
        "settleCorpCode":"结算单位编码",
         "serviceCode":"服务项编码",
         "feeCode":"费用编码",
         "receipayType":"receive",
         "prepayType":"prepay",
         "feeAmt":10,
         "feeUnit":"UNIT",
         "unitPrice":10.00,
         "unitCount":1,
         "currency":"USD",
         "remark":"备注说明2"
        }
    ]
  }
}