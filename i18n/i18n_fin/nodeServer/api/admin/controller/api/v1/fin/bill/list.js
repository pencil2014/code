module.exports = (params) => {
  return {
    "code": 0,
    "data": {
        "allColumns": [],
        "configColumns": [],
        "currPage": 1,
        "list": [
            {
                "confirmStatus": "no",
                "createdTime": "2020-09-18 02:01:50",
                "feeChange": false,
                "money": {
                    "pay": {
                        "CNY": 2.3,
                        'USD': 3202
                    }
                },
                "orderBillId": 19,
                "orderBillNo": "BILL2020091810014915",
                "orderNo": "S202009160000534",
                "receipayType": "pay",
                "settleCorpCode": "000001",
                "settleCorpName": "深圳分公司",
                "settleOrderNo": "123132",
                "state": "valid"
            },
            {
                "confirmStatus": "no",
                "createdTime": "2020-09-18 02:01:50",
                "feeChange": false,
                "money": {
                    "receive": {
                        "CNY": 2.5
                    }
                },
                "orderBillId": 18,
                "orderBillNo": "BILL2020091810014914",
                "orderNo": "S202009160000534",
                "receipayType": "receive",
                "settleCorpCode": "000001",
                "settleCorpName": "上海分公司",
                "settleOrderNo": "123132",
                "state": "valid"
            }
        ],
        "pageSize": 10,
        "totalCount": 2,
        "totalPage": 1
    },
    "msg": "success"
}
}