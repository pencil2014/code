module.exports = (params) => {
  return {
    "code": 0,
    "data": {
        "exchageRateList": [
            {
                "bocRate": 0,
                "createdBy": 0,
                "createdName": "",
                "createdTime": null,
                "effectDate": null,
                "exchangeRateId": 0,
                "exchangeRateTaskId": 0,
                "expireDate": null,
                "lowerRate": 0,
                "presetStatus": "",
                "rate": 6.85,
                "revision": 0,
                "srcCurrency": "USD",
                "state": "",
                "toCurrency": "CNY",
                "type": "",
                "updatedBy": 0,
                "updatedName": "",
                "updatedTime": null,
                "upperRate": 0,
                "yearMon": ""
            }
        ],
        "offSetPayFeeSumList": [],
        "offSetRecFeeSumList": [
            {
                "currency": "CNY",
                "sumAmt": 195.5
            }
        ],
        "offsetPayType": "receive",
        "orignalPayFeeSumList": [
            {
                "currency": "USD",
                "sumAmt": 110
            },
            {
                "currency": "CNY",
                "sumAmt": 130
            }
        ],
        "orignalRecFeeSumList": [
            {
                "currency": "USD",
                "sumAmt": 140
            },
            {
                "currency": "CNY",
                "sumAmt": 120
            }
        ],
        "settleCompCode": "000001",
        "settleCompName": "深圳分公司",
        "settleCorpCode": "code111",
        "settleCorpName": "测试客户1",
        "settleCycle": "monthly",
        "settleOrderFeeList": [
            {
                "badAmt": 0,
                "bizDate": "2020-09-23",
                "canUseSettleAmt": 110,
                "currency": "USD",
                "dedueAmt": 0,
                "exSettleAmt": 0,
                "feeAmt": 110,
                "feeAmtWithTax": 0,
                "feeCode": "truck001",
                "feeEnName": "truck001",
                "feeId": 75,
                "feeName": "拖车费",
                "finBillNo": "",
                "finDate": "2020-09-28",
                "gedgingAmt": 0,
                "invoiceAmt": 0,
                "noWriteoffAmt": 0,
                "orderNo": "",
                "receipayType": "pay",
                "serviceName": "",
                "settleAmt": 110,
                "settleApplyAmt": 110,
                "settleCompCode": "000001",
                "settleCompName": "深圳分公司",
                "settleCorpCode": "code111",
                "settleCorpName": "测试客户1",
                "settleCurrency": "CNY",
                "settleCycle": "monthly",
                "settleExRate": 6.85,
                "settleExRateId": 0,
                "settleLock": "lock",
                "settleOrderFeeId": 0,
                "settleOrderId": 0,
                "settleOrderNo": "",
                "sourceBizNo": "S202009230000553",
                "sourceType": "order",
                "taxRate": 0,
                "writeoffAmt": 0,
                "writeoffExRate": 0
            }
        ],
        "settleOrderNo": "Settle20201015163359000025",
        "settlePayFeeSumList": [
            {
                "currency": "CNY",
                "sumAmt": 110
            },
            {
                "currency": "CNY",
                "sumAmt": 130
            }
        ],
        "settleRecFeeSumList": [
            {
                "currency": "CNY",
                "sumAmt": 140
            },
            {
                "currency": "CNY",
                "sumAmt": 120
            }
        ]
    },
    "msg": "success"
  }
}