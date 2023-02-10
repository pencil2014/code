module.exports = (prams) => {
    return {
        "code": 0,
        "data": {
            "allColumns": [],
            "configColumns": [],
            "currPage": 1,
            "list": [
                {
                    "mark":"唛头",
                    "status":"xxx", //字典： warehouse_outplan_status
                    "createdBy": 5,
                    "createdName": "俊哥哥",
                    "createdTime": "2020-08-26T19:27:43",
                    "custid": 0,
                    "mark": "",
                    "oid": 4,
                    "orderNo": "",
                    "planNo": "12345",
                    "planTime": "2020-08-26T18:05:58",
                    "positionNo": "123",
                    "remark": "小伙子",
                    "warehouseOutplanItems": [
                        {
                            "cargoId": 1,
                            "cargoVo": {
                                "cargoId": 1,
                                "cname": "小猫",
                                "ename": "cat",
                                "hscode": "16413245643165341",
                                "mark": "xxx",
                                "type": "xx"
                            },
                            "oid":2,
                            "inBatchNo": "123",
                            "inItemId": 1,
                            "outplanItemId": 1,
                            "packageType": "bag",
                            "planNo": "123231",
                            "lastQuantity": 110,
                            "lastVolume": 110,
                            "lastWeight": 110,
                            "quantity": 50,
                            "volume": 50,
                            "weight": 50,
                            "createdBy": 0,
                            "createdName": "",
                            "createdTime": null,
                            "updatedBy": 0,
                            "updatedName": "",
                            "updatedTime": null,
                        }
                    ],
                    "status":"no", //字典：warehouse_inplan_status
                    "totalQuantity": 50,
                    "totalVolume": 50,
                    "totalWeight": 50,
                    "updatedBy": 0,
                    "updatedName": "",
                    "updatedTime": null,
                    "whId": 1,
                    "warehouseName":"xxx"
                }
            ],
            "pageSize": 10,
            "totalCount": 4,
            "totalPage": 1
        },
        "msg": "success"
    }
}