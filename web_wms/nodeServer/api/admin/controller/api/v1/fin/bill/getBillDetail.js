module.exports = (params) => {
  return {
    "code": 0,
    "data": {
        "billDate": "2020-09-10 22:47:31",
        "blNo": "",
        "custIntrustNo": "",
        "custName": "科技公司101",
        "custid": 101,
        "eta": null,
        "etd": null,
        "fees": [
            {
                "currency": "CNY",
                "feeAmt": 2.3,
                "feeHistoryId": 1,
                "feeId": 1,
                "maxFeeHistoryId": 1,
                "orderBillId": 1,
                "receipayType": "pay",
                "serviceName": "1",
                "settleAmt": 0,
                "unitCount": 1,
                "unitPrice": 0
            },
            {
                "currency": "USD",
                "feeAmt": 2.4,
                "feeHistoryId": 2,
                "feeId": 2,
                "maxFeeHistoryId": 3,
                "orderBillId": 1,
                "receipayType": "pay",
                "serviceName": "2",
                "settleAmt": 0,
                "unitCount": 2,
                "unitPrice": 0
            }
        ],
        "orderBillId": 1,
        "orderBillNo": "1",
        "orderNo": "S202009180000540",
        "podPortCname": "",
        "podPortCode": "33332",
        "podPortEname": "",
        "polPortCname": "的黎波里",
        "polPortCode": "LYTIP",
        "polPortEname": "TRIPOLI",
        "shipCarrierCode": "EVERGREEN",
        "so": "11111",
        "overdueDesc": "船开后，逾期罚金/票：驳船开10天内",
        "totalMap": {
            "USD": 2.4,
            "CNY": 2.3
        },
        "vessel": "",
        "voyage": ""
    },
    "msg": "success"
  }
}