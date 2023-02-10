module.exports = (prams) => {
    return {
      "code": 0,
      "data": [
          {
              "business": "ship",
              "businessType": "ship_export_fcl",
              "name": "海运出口整箱",
              "serviceTypeList": [
                  {
                      "businessType": "BT01",
                      "name": "委托订舱",
                      "serviceList": [
                        {
                            "businessType": "BT01",
                            "isDefault": "",
                            "isInput": "y",
                            "jobCode": "",
                            "oid": 1,
                            "serviceCode": "book",
                            "serviceName": "订舱",
                            "serviceType": "st01",
                            "sort": 0,
                            "state": "valid"
                        },
                        {
                            "businessType": "BT01",
                            "isDefault": "",
                            "isInput": "y",
                            "jobCode": "",
                            "oid": 3,
                            "serviceCode": "vgm",
                            "serviceName": "VGM",
                            "serviceType": "st01",
                            "sort": 0,
                            "state": "valid"
                        },
                        {
                            "businessType": "BT01",
                            "isDefault": "",
                            "isInput": "y",
                            "jobCode": "",
                            "oid": 3,
                            "serviceCode": "bill_of_loading",
                            "serviceName": "提单",
                            "serviceType": "st01",
                            "sort": 0,
                            "state": "valid"
                        },
                        {
                            "businessType": "BT01",
                            "isDefault": "",
                            "isInput": "y",
                            "jobCode": "",
                            "oid": 3,
                            "serviceCode": "dangerous",
                            "serviceName": "危险品",
                            "serviceType": "st01",
                            "sort": 0,
                            "state": "valid"
                        },
                        {
                            "businessType": "BT01",
                            "isDefault": "",
                            "isInput": "y",
                            "jobCode": "",
                            "oid": 2,
                            "serviceCode": "truck",
                            "serviceName": "拖柜",
                            "serviceType": "st01",
                            "sort": 0,
                            "state": "valid"
                        },
                        {
                            "businessType": "BT01",
                            "isDefault": "",
                            "isInput": "y",
                            "jobCode": "",
                            "oid": 3,
                            "serviceCode": "pol_declaration",
                            "serviceName": "代理报关",
                            "serviceType": "st01",
                            "sort": 0,
                            "state": "valid"
                        },
                        {
                            "businessType": "BT01",
                            "isDefault": "",
                            "isInput": "y",
                            "jobCode": "",
                            "oid": 3,
                            "serviceCode": "pol_advance_tariff",
                            "serviceName": "代垫关税",
                            "serviceType": "st01",
                            "sort": 0,
                            "state": "valid"
                        },
                        {
                            "businessType": "BT01",
                            "isDefault": "",
                            "isInput": "y",
                            "jobCode": "",
                            "oid": 3,
                            "serviceCode": "pol_inspection",
                            "serviceName": "代理报检",
                            "serviceType": "st01",
                            "sort": 0,
                            "state": "valid"
                        },
                        {
                            "businessType": "BT01",
                            "isDefault": "",
                            "isInput": "y",
                            "jobCode": "",
                            "oid": 3,
                            "serviceCode": "doc",
                            "serviceName": "贸易单证",
                            "serviceType": "st01",
                            "sort": 0,
                            "state": "valid"
                        },
                        {
                            "businessType": "BT01",
                            "isDefault": "",
                            "isInput": "y",
                            "jobCode": "",
                            "oid": 3,
                            "serviceCode": "letter_of_guarantee",
                            "serviceName": "保函",
                            "serviceType": "st01",
                            "sort": 0,
                            "state": "valid"
                        },
                        {
                            "businessType": "BT01",
                            "isDefault": "",
                            "isInput": "y",
                            "jobCode": "",
                            "oid": 3,
                            "serviceCode": "pol_ltl",
                            "serviceName": "散车收货",
                            "serviceType": "st01",
                            "sort": 0,
                            "state": "valid"
                        },
                        {
                            "businessType": "BT01",
                            "isDefault": "",
                            "isInput": "y",
                            "jobCode": "",
                            "oid": 3,
                            "serviceCode": "pol_warehouse",
                            "serviceName": "仓储",
                            "serviceType": "st01",
                            "sort": 0,
                            "state": "valid"
                        },
                        {
                            "businessType": "BT01",
                            "isDefault": "",
                            "isInput": "y",
                            "jobCode": "",
                            "oid": 3,
                            "serviceCode": "stuffing",
                            "serviceName": "堆场装箱",
                            "serviceType": "st01",
                            "sort": 0,
                            "state": "valid"
                        },
                        {
                            "businessType": "BT01",
                            "isDefault": "",
                            "isInput": "y",
                            "jobCode": "",
                            "oid": 3,
                            "serviceCode": "fume",
                            "serviceName": "熏蒸",
                            "serviceType": "st01",
                            "sort": 0,
                            "state": "valid"
                        }
                      ],
                      "serviceType": "st01",
                      "state": "valid",
                      "typeId": 1
                  },
                  {
                      "businessType": "BT01",
                      "name": "客户自订",
                      "serviceList": [
                          {
                            "businessType": "BT01",
                            "isDefault": "",
                            "isInput": "y",
                            "jobCode": "",
                            "oid": 1,
                            "serviceCode": "SD001",
                            "serviceName": "报关",
                            "serviceType": "st01",
                            "sort": 0,
                            "state": "valid"
                          }
                      ],
                      "serviceType": "st02",
                      "state": "valid",
                      "typeId": 2
                  }
              ],
              "state": "valid",
              "typeId": 1
          },
          {
              "business": "ship",
              "businessType": "BT02",
              "name": "海运出口拼箱",
              "serviceTypeList": [],
              "state": "valid",
              "typeId": 2
          }
        ],
      "msg": "success"
    }
};
