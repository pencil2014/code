module.exports = (prams) => {
    return {
        "code":0,
        "msg":"success",
        "data":{
            "allColumns": [],
            "configColumns": [],
            "currPage": 1,
            "list": [
                {
                    "businessType": "shipping", //字典: business_type
                    "createdBy": 0,
                    "createdName": "",
                    "createdTime": null,
                    "expressNo": "123456789",
                    "expressSupplierId": "1",
                    "expressSupplierName": "顺丰",
                    "expressType": "foreign", //字典： express_type
                    "postId": 1,
                    "postTime": "2020-09-16T14:52:27",
                    "postType": "post",  //字典： post_typ
                    "postUser": "小浪儿",
                    "receiveAddress": "南山科技园",
                    "receiveCompany": "腾讯",
                    "receiveCompanyId": "1",
                    "recipient": "小三",
                    "recipientPhone": "13480690609",
                    "revision": 1,
                    "sendAddress": "罗湖黄贝岭",
                    "sendCompany": "长帆",
                    "sendCompanyId": "2",
                    "sender": "俊儿",
                    "senderPhone": "13480691609",
                    "signTime": "2020-09-16T14:52:40",
                    "signUser": "前台",
                    "state": "valid",
                    "status": "finish", //字典： post_status
                    "updatedBy": 0,
                    "updatedName": "",
                    "updatedTime": null,
                    "amt":10.00,
                    "currency":"CNY", //字典：currency
                    "receisendType":"receive", //字典：receisend_type
                    "payType":"prepaid", //字典：express_pay_type
                    "expressCode":"xxx",
                    "payer":"owner", //字典：express_payer
                    "company_code":"xxx", 
                    "company_name":"长帆",
                    "feeStatus":"xxx", //字典：express_fee_status
                    "relates":["xx","xx"]
                }
            ],
            "pageSize": 10,
            "totalCount": 1,
            "totalPage": 1
        }
    }
};
