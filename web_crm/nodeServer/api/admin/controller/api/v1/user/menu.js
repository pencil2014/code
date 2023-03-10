
module.exports = (prams) => {
    return {
        "msg":"操作成功",
        "code": 0,
        "data":[
            {
                "name":"Charge",
                "path":"/charge",
                "hidden":false,
                "redirect":"/charge/maintain/",
                "component":"Layout",
                "alwaysShow":true,
                "meta":{
                    "title":"运价",
                    "icon":"nested"
                },
                "children":[
                    {
                        "name":"Maintain",
                        "path":"maintain",
                        "hidden":false,
                        "redirect":"noRedirect",
                        "component":"charge/maintain/index",
                        "alwaysShow":true,
                        "meta":{
                            "title":"运价维护",
                        },
                        "children":[
                            {
                                "name":"MainRoute",
                                "path":"mainRoute",
                                "hidden":false,
                                "component":"charge/maintain/mainRoute",
                                "meta":{
                                    "title":"海运出口整箱",
                                }
                            },
                            {
                                "name":"MainRouteDetail",
                                "path":"mainRouteDetail",
                                "hidden":true,
                                "component":"charge/maintain/mainRoute/detail",
                                "meta":{
                                    "title":"海运出口整箱详情",
                                }
                            },
                            {
                                "name":"FeederRoute",
                                "path":"feederRoute",
                                "hidden":false,
                                "component":"charge/maintain/feederRoute",
                                "meta":{
                                    "title":"海运整箱驳船费",
                                }
                            },
                            {
                                "name":"FeederRouteDetail",
                                "path":"feederRouteDetail",
                                "hidden":true,
                                "component":"charge/maintain/feederRoute/detail",
                                "meta":{
                                    "title":"海运整箱驳船费详情",
                                }
                            },
                            {
                                "name":"Surcharge",
                                "path":"surcharge",
                                "hidden":false,
                                "component":"charge/maintain/surcharge",
                                "meta":{
                                    "title":"附加费模板管理",
                                }
                            },
                            {
                                "name":"WeightLimit",
                                "path":"weightLimit",
                                "hidden":false,
                                "component":"charge/maintain/weightLimit",
                                "meta":{
                                    "title":"限重模板管理",
                                }
                            },
                            {
                                path: 'routeImport',
                                component: "charge/maintain/routeImport",
                                name: 'RouteImport',
                                meta: { title: '批量导入' }
                            },
                            {
                                path: 'routeImportDetail',
                                component: "charge/maintain/routeImport/routeImportDetail",
                                name: 'RouteImportDetail',
                                meta: { title: '批量导入-详情' },
                                hidden: true
                              }
                        ]
                    },
                    // {
                    //     "name":"ChargeSearch",
                    //     "path":"chargeSearch",
                    //     "hidden":false,
                    //     "redirect":"noRedirect",
                    //     "component":"charge/chargeSearch/index",
                    //     "alwaysShow":true,
                    //     "meta":{
                    //         "title":"运价查询",
                    //     },
                    //     children: [
                    //         {
                    //             "name":"SeaFreight",
                    //             "path":"seaFreight",
                    //             "hidden":false,
                    //             "component":"charge/chargeSearch/seaFreight",
                    //             "meta":{
                    //                 "title":"海运价查询",
                    //             }
                    //         },
                    //         {
                    //             "name":"SeaFreighDetail",
                    //             "path":"seaFreighDetail",
                    //             "hidden":true,
                    //             "component":"charge/chargeSearch/seaFreight/seaFreightDetail",
                    //             "meta":{
                    //                 "title":"海运价详情",
                    //             }
                    //         },
                    //         {
                    //             "name":"SeaFreighPrice",
                    //             "path":"seaFreighPrice",
                    //             "hidden":true,
                    //             "component":"charge/chargeSearch/seaFreight/seaFreightPrice",
                    //             "meta":{
                    //                 "title":"海运价报价单",
                    //             }
                    //         },
                    //         {
                    //             "name":"BargeFee",
                    //             "path":"bargeFee",
                    //             "hidden":false,
                    //             "component":"charge/chargeSearch/bargeFee",
                    //             "meta":{
                    //                 "title":"驳船费查询",
                    //             }
                    //         },
                    //         {
                    //             "name":"BargeFeeDetail",
                    //             "path":"bargeFeeDetail",
                    //             "hidden":true,
                    //             "component":"charge/chargeSearch/bargeFee/detail",
                    //             "meta":{
                    //                 "title":"驳船费详情",
                    //             }
                    //         }
                    //     ]
                    // },
                ]
            },
            {
                "name":"Order",
                "path":"/order",
                "hidden":false,
                "redirect":"/order/order/",
                "component":"Layout",
                "alwaysShow":true,
                "meta":{
                    "title":"订单",
                    "icon":"nested"
                },
                "children":[
                    {
                        "name":"Order",
                        "path":"order",
                        "hidden":false,
                        "redirect":"noRedirect",
                        "component":"order/order/index",
                        "alwaysShow":true,
                        "meta":{
                            "title":"订单列表",
                        },
                        "children":[
                            {
                                "name":"Orderlist",
                                "path":"orderList",
                                "hidden":false,
                                "component":"order/order/orderList",
                                "meta":{
                                    "title":"订单查询",
                                }
                            },
                            // {
                            //     "name":"OrderDetail",
                            //     "path":"orderDetail",
                            //     "hidden":true,
                            //     "component":"order/order/orderList/detail",
                            //     "meta":{
                            //         "title":"订单查询详情",
                            //     }
                            // },
                            {
                                "name":"BookShip",
                                "path":"bookShip",
                                "hidden":false,
                                "component":"order/order/bookShip",
                                "meta":{
                                    "title":"订舱查询",
                                }
                            },
                            {
                                "name":"BookShip",
                                "path":"bookShip",
                                "hidden":false,
                                "component":"order/order/soList",
                                "meta":{
                                    "title":"SO列表",
                                }
                            },
                        ]
                    },{
                        "name":"Warehouse",
                        "path":"warehouse",
                        "hidden":false,
                        "redirect":"noRedirect",
                        "component":"order/warehouse/index",
                        "alwaysShow":true,
                        "meta":{
                            "title":"订单列表",
                        },
                        "children":[
                            {
                                "name":"WarehouseInfo",
                                "path":"warehouseInfo",
                                "hidden":false,
                                "component":"order/warehouse/warehouseInfo",
                                "meta":{
                                    "title":"仓库信息",
                                }
                            },{
                                "name":"WarehouseIn",
                                "path":"warehouseIn",
                                "hidden":false,
                                "component":"order/warehouse/warehouseIn",
                                "meta":{
                                    "title":"进仓信息",
                                }
                            },{
                                "name":"WarehouseOut",
                                "path":"warehouseOut",
                                "hidden":false,
                                "component":"order/warehouse/warehouseOut",
                                "meta":{
                                    "title":"出仓信息",
                                }
                            },{
                                "name":"WarehouseCargo",
                                "path":"warehouseCargo",
                                "hidden":false,
                                "component":"order/warehouse/warehouseCargo",
                                "meta":{
                                    "title":"库存信息",
                                }
                            },
                        ]
                    }
                ]
            }
        ]
    }
};