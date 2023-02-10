module.exports = (params) => {
  return {
    "code": 0,
    "data": {
        "totalAmountList": [{
         "currency":"CNY",
         "amt":100
        },{
         "currency":"USD",
         "amt":100
        }],
        "orderFeeList": [
            {
                "badAmt": 0.00,
                "currency": "CNY",
                "dedueAmt": 0.00,
                "exSettleAmt": 100.00,
                "feeAmt": 2400.00,
                "feeAmtWithTax": 0,
                "feeCode": "LSS",
                "feeEnName": "LSS",
                "feeId": 5,
                "feeName": "低硫燃油附加费",
                "finBillNo": "123",
                "invoiceAmt": 0.00,
                "noWriteoffAmt": 0,
                "orderNo": "123",
                "receipayType": "",
                "settleAmt": 100.00,
                "settleCompCode": "000001",
                "settleCompName": "深圳分公司",
                "settleCorpCode": "code111",
                "settleCorpName": "",
                "settleCurrency": "USD",
                "settleCycle": "",
                "settleExRate": 0.2000000000,
                "settleExRateId": 1,
                "settleOrderFeeId": 1,
                "settleOrderId": 1,
                "taxRate": 6.0000000000,
                "writeoffAmt": 0.00,
                "writeoffExRate": 1.0000000000,
                settleOrderNo: 1
            },
            {
                "badAmt": 0.00,
                "currency": "USD",
                "dedueAmt": 0.00,
                "exSettleAmt": 100.00,
                "feeAmt": 6000.00,
                "feeAmtWithTax": 0,
                "feeCode": "LSS",
                "feeEnName": "LSS",
                "feeId": 6,
                "feeName": "低硫燃油附加费",
                "finBillNo": "123",
                "invoiceAmt": 0.00,
                "noWriteoffAmt": 0,
                "orderNo": "123",
                "receipayType": "",
                "settleAmt": 200.00,
                "settleCompCode": "000001",
                "settleCompName": "深圳分公司",
                "settleCorpCode": "000007",
                "settleCorpName": "",
                "settleCurrency": "USD",
                "settleCycle": "",
                "settleExRate": 0.2000000000,
                "settleExRateId": 1,
                "settleOrderFeeId": 2,
                "settleOrderId": 1,
                "taxRate": 6.0000000000,
                "writeoffAmt": 0.00,
                "writeoffExRate": 1.0000000000,
                settleOrderNo: 2
            }
        ]
    },
    "msg": "success"
  }
}