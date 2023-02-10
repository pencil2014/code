module.exports = (params) => {
    return {
        "code":0,
        "data":{
            "settleCycle":"电汇",
            "settleReceive":"USD100 CNY200",
            "settlePay":"USD100 CNY200",
            "settleExRate":[
                {
                    "originCurrency":"USD",
                    "settleCurrency":"CNY",
                    "settleExRate":1
                }
            ],
            "orderReceiveFeeStatistics":[
                {
                    "orderNo":"23423",
                    "receiveFee":"USD100 CNY200",
                    "receiveWriteoffFee":"USD0 CNY0",
                    "receiveNoRecFee":"USD100 CNY200"
                }
            ]
        },
        "msg":"success"
    }
}