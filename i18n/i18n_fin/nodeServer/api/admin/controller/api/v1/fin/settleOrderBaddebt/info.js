module.exports = (params) => {
  return {
    "code": 0,
    "data": {
      "badReason": "under_payment",
      "badType": "badtype",
      "dealWay": "deduction_of_profit",
      "settleOrderBaddebtId": 'settleOrderBaddebtId',
      "recFeeList": [
        {
          "badAmt": 140,
          "currency": "USD",
          "feeCode": "truck001",
          "feeEnName": "truck001",
          "feeName": "拖车费",
          "feeUnit": "UNIT",
          "receipayType": "receive",
          "settleAmt": 140,
          "settleCompName": "美国分公司",
          "settleCorpName": "深圳分公司",
          "settleCurrency": "CNY",
          "settleCycle": "monthly",
          "settleExRate": 6.85,
          "writeoffAmt": 0,
          "feeAmt": 100,
          "serviceName": 'serviceName',
          "unitPrice": 'unitPrice'
        },
        {
          "badAmt": 140,
          "currency": "USD",
          "feeCode": "truck001",
          "feeEnName": "truck001",
          "feeName": "拖车费",
          "feeUnit": "UNIT",
          "receipayType": "receive",
          "settleAmt": 140,
          "settleCompName": "美国分公司",
          "settleCorpName": "深圳分公司",
          "settleCurrency": "CNY",
          "settleCycle": "monthly",
          "settleExRate": 6.85,
          "writeoffAmt": 0,
          "feeAmt": 100,
          "serviceName": 'serviceName',
          "unitPrice": 'unitPrice'
        }
      ],
      "recFeeSumList": [
        {
          "currency": "USD",
          "sumAmt": 140
        }
      ],
      "settleCompName": "美国分公司",
      "settleCorpName": "深圳分公司",
      "settleOrderNo": "Settle2020101022005"
    },
    "msg": "success"
  }
}