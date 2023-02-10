module.exports = (params) => {
    return {
        "code": 0,
        "data": {
            "bankAccountList": [
                {
                    "accountName": "疏风物流",
                    "accountNo": "412345641515",
                    "acountShortName": "s",
                    "bankBranch": "建设银行新安支行",
                    "bankBranchCode": "12234",
                    "bankName": "建设银行",
                    "currency": "USD",
                    "receipayType": "收付",
                    "remark": "",
                    "settleUnitBankAcctId": 4,
                    "state": "valid",
                    "unitCode": "code111",
                    "unitName": "测试客户1"
                }
            ],
            "recvAccountName": "疏风物流",
            "recvAccountNo": "412345641515",
            "recvBankAccountId": 4,
            "recvBankBranch": "建设银行新安支行",
            "recvBankCode": "12234",
            "recvBankName": "建设银行",
            "recvCorpCode": "code111",
            "recvCorpName": "测试客户1",
            "settleUnitList": [
                {
                    "createdBy": 0,
                    "createdName": "",
                    "createdTime": null,
                    "finCode": "code111",
                    "revision": 0,
                    "settleCycle": "ticket",
                    "settleUnitId": 2,
                    "state": "valid",
                    "unitCode": "code111",
                    "unitName": "测试客户1",
                    "unitRefId": 101,
                    "unitType": "customer",
                    "updatedBy": 0,
                    "updatedName": "",
                    "updatedTime": null
                }
            ]
        },
        "msg": "success"
    }
}