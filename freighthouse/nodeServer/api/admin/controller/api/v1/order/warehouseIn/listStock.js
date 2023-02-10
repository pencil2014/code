module.exports = (prams) => {
    return {
        "code": 0,
        "data": {
            "allColumns": [],
            "configColumns": [],
            "currPage": 1,
            "list": [
                {
                    "inBatchNo":"入仓编号1",
                    "itemId":1,//入仓项ID
                    "cargoId": 1,
                    "cargoVo": {
                        "cargoId": 1,
                        "cname": "小猫",
                        "ename": "cat",
                        "hscode": "16413245643165341",
                        "mark": "唛头",
                        "type": "xx"
                    },
                    "packageType": "bag",
                    "quantity": 100,
                    "volume": 100,
                    "weight": 100,
                    "lastQuantity": 100,
                    "lastVolume": 100,
                    "lastWeight": 100,
                    "updatedBy": 0,
                    "updatedName": "",
                    "updatedTime": null,
                    "createdBy": 0,
                    "createdName": "",
                    "createdTime": "2020-08-26T15:40:35",
                },
                {
                    "inBatchNo":"入仓编号2",
                    "itemId":1,//入仓项ID
                    "cargoId": 1,
                    "cargoVo": {
                        "cargoId": 2,
                        "cname": "小狗",
                        "ename": "cat",
                        "hscode": "16413245643165341",
                        "mark": "唛头",
                        "type": "xx"
                    },
                    "packageType": "bag",
                    "quantity": 100,
                    "volume": 100,
                    "weight": 100,
                    "lastQuantity": 120,
                    "lastVolume": 120,
                    "lastWeight": 120,
                    "updatedBy": 0,
                    "updatedName": "",
                    "updatedTime": null,
                    "createdBy": 0,
                    "createdName": "",
                    "createdTime": "2020-08-26T15:40:35",
                }
            ],
            "pageSize": 10,
            "totalCount": 5,
            "totalPage": 1
        },
        "msg": "success"
    }
}