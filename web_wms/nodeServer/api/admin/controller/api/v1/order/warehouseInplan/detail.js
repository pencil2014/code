module.exports = (prams) => {
    return {
        "code": 0,
        "data": {
            "orderNo":"订单号",
            "mark":"唛头",
            "status":"xx", //字典：warehouse_inplan_status
            "createdBy": 8,
            "createdName": "",
            "createdTime": "2020-08-26T15:40:35",
            "deliveryContact": "俊妹妹",
            "deliveryContactPhone": "13480691607",
            "deliveryCustName": "科技公司1",
            "deliveryCustid": 1,
            "inRemark": "备注",
            "oid": 3,
            "planNo": "12347",
            "positionNo": "134564568",
            "planEnterTime": null,
            "updatedBy": 0,
            "updatedName": "",
            "updatedTime": null,
            "warehouseInplanItems": [],
            "warehouseName": "测试必须的",
            "whId": 1,
            "warehouseInplanItems": [
                {
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
                    "createdTime": "2020-08-26T15:40:35",
                    "oid": 2,
                    "packageType": "bag",
                    "planNo": "12347",
                    "quantity": 100,
                    "updatedBy": 0,
                    "updatedName": "",
                    "updatedTime": null,
                    "volume": 100,
                    "weight": 100
                }
            ]
        },
        "msg": "success"
    }
}