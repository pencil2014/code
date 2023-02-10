module.exports = (params) => {
    return {
        "code":0,
        "data":{
            "useWriteoffAmt":2323,
            "settleCurrencyAmtSummary":"CNY 23232",
            "orgCurrencyAmtSummary":"USD 3232|CNY 2321",
            "settleExRateSummarys":[
                "USD-CNY 6.9"
            ],
            "payOrder":{
                "currency":"CNY",
                "applyAmt":2345,
                "bankSeqNo":"32749232432",
                "payOrderId":12,
                "payOrderNo":"PAY232434324324",
                "sourceApplyNo":"PAYSET434343243",
                "orderType":"settle_pay",
                "payInfo":{
                    "currency":"CNY",
                    "invoiceNo":"9430284032,23432432,3423424",
                    "payAccountNo":"3728648324",
                    "payBankName":"建设银行",
                    "recvAccountNo":"600023232",
                    "recvBankName":"农业银行",
                    "recvCorpName":"上海平安付",
                    "settleOrderNo":"43243242,43243242"
                }
            },
            "prepayUsables":[
                {
                    "payOrderId":12,
                    "prepayAccountId":1,
                    "payApplyPrepayId":1,
                    "realpayAmt":123,
                    "balance":100,
                    "currentUseAmt":23,
                    "currency":"CNY"
                }
            ],
            "transferFeeList":[
                {
                    "transferFeeId":12,
                    "feeId":123,
                    "amt":100,
                    "currency":"CNY",
                    "cutType":"exter_cut",
                    "hasAllotAmt":0,
                    "allotAmt":100
                }
            ],
            "writeoffItems":[
                {
                    "settleCorpCode":"0000023",
                    "settleCorpName":"深圳分公司",
                    "settleOrderNo":"232121",
                    "settleOrderFeeId":12,
                    "feeId":12,
                    "feeName":null,
                    "feeEnName":null,
                    "settleAmt":null,
                    "originalCurrency":null,
                    "exSettleAmt":null,
                    "settleCurrency":null,
                    "settleExRate":null,
                    "writeoffCurrency":null,
                    "WirteoffFeeAmt":12,
                    "serviceName":null,
                    "feeUnit":null,
                    "unitPrice":233,
                    "unitCount":12
                }
            ]
        },
        "msg":"success"
    }
}