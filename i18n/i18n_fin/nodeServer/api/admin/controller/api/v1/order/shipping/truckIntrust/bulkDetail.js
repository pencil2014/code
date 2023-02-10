module.exports = (prams) => {
  return {
    "code": 0,
    "data":{
        "oid": 8,
       "boxRemark": "注意啦，这单hin重要",
       "dispatchStatus": "done",
       "intrustNo": "world_0001",
       "intrustStatus": "done",
       "loadType": "collect", //字典：load_type
       "orderNo": "hello_003",
       "supplierContact": "俊哥哥",
       "supplierContactPhone": "13480691609",
       "supplierId": 1,
       "supplierName": "长帆供应商",
       "warehouseInoutType":"in", //字典：warehouse_inout_type
       "truckLoads":[
       {
            "boxAddress": "具体地址在哪里",
            "boxArea": "广东省深圳市南山区",
            "boxContact": "max",
            "boxContactPhone": "13838383838",
            "boxTime": "2020-07-27T16:00:00",
            "inPlanNo": "xx11",
            "inWhId": "1",
            "intrustNo": "hello_003",
            "orderNo": "world_0001",
            "outPlanNo": "xx11",
            "outWhId": "1",
            "preBoxTime": "2020-07-27T16:00:00",
            "custid": 1,
            "custName": "长帆供应商",
            "truckDriver": {
                "driverId":1,
                "driverName": "panjun",
                "driverPhone": "13939393939",
                "licensePlate": "粤B 8888",
                "orderNo": "world_0001"
            },
            "truckCargos": [
                {
                    "loadId": 6,
                    "oid": 1,
                    "packageType": "BAG",
                    "quantity": 5,
                    "volume": 10,
                    "weight": 20,
                    "cargoId":1,
                    "cname":"中文品名",
                    "mark":"唛头",
                    "hscode":"hscode",
                }
            ],
            "unloadAddress": "具体地址在哪里",
            "unloadArea": "广东省深圳市南山区",
            "unloadContact": "jack.huang",
            "unloadContactPhone": "13737373737",
            "loadId":1
        }
       ]
 },
    "msg": "success"
}
};
