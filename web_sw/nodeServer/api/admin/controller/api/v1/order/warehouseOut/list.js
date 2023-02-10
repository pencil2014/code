module.exports = (prams) => {
    return {
        "code": 0,
        "data": {
            "allColumns": [],
            "configColumns": [],
            "currPage": 1,
            "list": [
                {
                    "batchNo": "0123456",
                    "cname": "小猫",
                    "mark":"唛头",
                    "createdBy": 5,
                    "createdName": "俊哥哥",
                    "createdTime": "2020-08-26T20:04:11",
                    "custid": 0,
                    "mark": "",
                    "oid": 6,
                    "orderNo": "",
                    "outTime": "2020-08-26T19:44:07",
                    "planNo": "123",
                    "positionNo": "",
                    "totalQuantity": 20,
                    "totalVolume": 20,
                    "totalWeight": 20,
                    "updatedBy": 0,
                    "updatedName": "",
                    "updatedTime": null,        
                    "warehouseOutContainers": [{
                        "oid":1,
                        "batchNo":"xx",
                        "containerId":1,
                        "packageType":"bag",
                        "so":"xxx",
                        "cn":"xxx",
                        "sn":"xxx"
                    }],
                    "warehouseOutItems": [
                        {
                            "batchNo": "0123456",
                            "cargoId": 1,
                            "cargoVo": {
                                "cargoId": 1,
                                "cname": "小猫",
                                "ename": "cat",
                                "hscode": "16413245643165341",
                                "mark": "",
                                "type": "xx"
                            },
                            "createdBy": 0,
                            "createdName": "",
                            "createdTime": null,
                            "inBatchNo": "123456",
                            "inItemId": 1,
                            "outItemId": 1,
                            "packageType": "bag",
                            "quantity": 20,
                            "updatedBy": 0,
                            "updatedName": "",
                            "updatedTime": null,
                            "volume": 20,
                            "weight": 20,
                            "lastQuantity": 100,
                            "lastVolume": 100,
                            "lastWeight": 100
                        }
                    ],
                    "whBatchNo": "154564",
                    "whId": 1,
                    "warehouseName":"xxx"
                }
            ],
            "pageSize": 10,
            "totalCount": 5,
            "totalPage": 1
        },
        "msg": "success"
    }
}