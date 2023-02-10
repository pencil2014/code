module.exports = (prams) => {
    return {
        "code": 0,
        "data": {
            "allColumns": [],
            "configColumns": [],
            "currPage": 1,
            "list": [
                {
                    "batchNo": "WIB2020082600003",
                    "cname": "小猫",
                    "createdBy": 8,
                    "createdName": "",
                    "createdTime": "2020-08-26T17:23:47",
                    "deliveryContact": "潘俊小哥哥",
                    "deliveryContactPhone": "13480691609",
                    "deliveryCustName": "科技公司1",
                    "deliveryCustid": 1,
                    "mark": "eedddd",
                    "oid": 8,
                    "planNo": "123456",
                    "positionNo": "11111",
                    "realEnterTime": "2020-08-26T15:43:33",
                    "totalQuantity": 100,
                    "totalVolume": 100,
                    "totalWeight": 100,
                    "updatedBy": 0,
                    "updatedName": "",
                    "updatedTime": null,
                    "status":"yes", //字典：warehouse_inplan_status
                    warehouseName: "测试仓库",
                    "warehouseInItems": [{
                        "cargoId": 1,
                        "cargoVo": {
                            "cargoId": 1,
                            "cname": "小猫",
                            "ename": "cat",
                            "hscode": "16413245643165341",
                            "mark": "备注",
                            "type": "xx"
                        },
                        "oid":2,
                        "inBatchNo": "123",
                        "inItemId": 1,
                        "outplanItemId": 1,
                        "packageType": "bag",
                        "planNo": "123",
                        "lastQuantity": 80,
                        "lastVolume": 80,
                        "lastWeight": 80,
                        "quantity": 50,
                        "volume": 50,
                        "weight": 50,
                        "createdBy": 0,
                        "createdName": "",
                        "createdTime": null,
                        "updatedBy": 0,
                        "updatedName": "",
                        "updatedTime": null,
                    }],
                    "whBatchNo": "987654327",
                    "whId": 1
                }
            ],
            "pageSize": 10,
            "totalCount": 5,
            "totalPage": 1
        },
        "msg": "success"
    }
}