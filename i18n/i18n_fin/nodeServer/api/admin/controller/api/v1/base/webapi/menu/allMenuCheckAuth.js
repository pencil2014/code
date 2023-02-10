module.exports = (prams) => {
    return {
        "code" : 0,
        "data" : [
           {
              "auth" : "yes",
              "resourceCode" : "Charge",
              "resourceName" : "运价",
              "resourceType" : "menu",
              "subResource" : [
                 {
                    "auth" : "yes",
                    "resourceCode" : "Maintain",
                    "resourceName" : "运价维护",
                    "resourceType" : "menu",
                    "subResource" : [
                       {
                          "auth" : "yes",
                          "resourceCode" : "MainRoute",
                          "resourceName" : "海运出口整箱",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "FeederRoute",
                          "resourceName" : "海运整箱驳船费",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "Surcharge",
                          "resourceName" : "附加费模板管理",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "WeightLimit",
                          "resourceName" : "限重模板管理",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "RouteImport",
                          "resourceName" : "批量导入",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       }
                    ],
                    "type" : "role"
                 },
                 {
                    "auth" : "yes",
                    "resourceCode" : "ChargeSearch",
                    "resourceName" : "运价查询",
                    "resourceType" : "menu",
                    "subResource" : [
                       {
                          "auth" : "yes",
                          "resourceCode" : "SeaFreight",
                          "resourceName" : "海运价查询",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "BargeFee",
                          "resourceName" : "驳船费查询",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       }
                    ],
                    "type" : "role"
                 }
              ],
              "type" : "role"
           },
           {
              "auth" : "yes",
              "resourceCode" : "SeaShipping",
              "resourceName" : "海运",
              "resourceType" : "menu",
              "subResource" : [
                 {
                    "auth" : "yes",
                    "resourceCode" : "Order",
                    "resourceName" : "订单",
                    "resourceType" : "menu",
                    "subResource" : [
                       {
                          "auth" : "yes",
                          "resourceCode" : "OrderList",
                          "resourceName" : "订单列表",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "JointList",
                          "resourceName" : "协同订单",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "SiList",
                          "resourceName" : "补料列表",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "ImportBill",
                          "resourceName" : "账单列表",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "TakeList",
                          "resourceName" : "取单列表",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "PutList",
                          "resourceName" : "放单列表",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "BlFinList",
                          "resourceName" : "财务审核列表",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "BlFinApplyList",
                          "resourceName" : "放单申请列表",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "SiDnList",
                          "resourceName" : "费用审核列表",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "LclAuditList",
                          "resourceName" : "订仓列表",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "LclOrderList",
                          "resourceName" : "散货订单列表",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "FclOrderList",
                          "resourceName" : "散货拼箱列表",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "HblTakeList",
                          "resourceName" : "hbl取单列表",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "MblTakeList",
                          "resourceName" : "mbl取单列表",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "TradeTakeList",
                          "resourceName" : "贸易单证取单列表",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "PlanOrderList",
                          "resourceName" : "计划单",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "OrderReport",
                          "resourceName" : "订单报表",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       }
                    ],
                    "type" : "role"
                 },
                 {
                    "auth" : "yes",
                    "resourceCode" : "Book",
                    "resourceName" : "订舱",
                    "resourceType" : "menu",
                    "subResource" : [
                       {
                          "auth" : "yes",
                          "resourceCode" : "BookShip",
                          "resourceName" : "订舱查询",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "SoLost",
                          "resourceName" : "SO列表",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       }
                    ],
                    "type" : "role"
                 },
                 {
                    "auth" : "yes",
                    "resourceCode" : "PostList",
                    "resourceName" : "寄单管理",
                    "resourceType" : "menu",
                    "subResource" : [],
                    "type" : "role"
                 },
                 {
                    "auth" : "yes",
                    "resourceCode" : "WorkException",
                    "resourceName" : "异常管理",
                    "resourceType" : "menu",
                    "subResource" : [],
                    "type" : "role"
                 },
                 {
                    "auth" : "yes",
                    "resourceCode" : "WarehouseIndex",
                    "resourceName" : "仓库",
                    "resourceType" : "menu",
                    "subResource" : [
                       {
                          "auth" : "yes",
                          "resourceCode" : "WarehouseInfo",
                          "resourceName" : "仓库信息",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "WarehouseIn",
                          "resourceName" : "进仓信息",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "WarehouseOut",
                          "resourceName" : "出仓信息",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "WarehouseCargo",
                          "resourceName" : "库存信息",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       }
                    ],
                    "type" : "role"
                 }
              ],
              "type" : "role"
           },
           {
              "auth" : "yes",
              "resourceCode" : "Finance",
              "resourceName" : "财务",
              "resourceType" : "menu",
              "subResource" : [
                 {
                    "auth" : "yes",
                    "resourceCode" : "route-OrderFee",
                    "resourceName" : "订单详情费用",
                    "resourceType" : "module",
                    "subResource" : [
                       {
                          "auth" : "yes",
                          "resourceCode" : "tab-totalFee",
                          "resourceName" : "tab-全部费用",
                          "resourceType" : "module",
                          "subResource" : [
                             {
                                "auth" : "yes",
                                "resourceCode" : "page-show",
                                "resourceName" : "基本信息",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-createSettlement",
                                "resourceName" : "按钮-生成结算单",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             }
                          ],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "tab-businessFee",
                          "resourceName" : "tab-业务费用",
                          "resourceType" : "module",
                          "subResource" : [
                             {
                                "auth" : "yes",
                                "resourceCode" : "page-show",
                                "resourceName" : "基本信息",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-openSaveTemplate",
                                "resourceName" : "按钮-另存模板",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-selectTemplate",
                                "resourceName" : "按钮-选择模板导入",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-modifySettleUnit",
                                "resourceName" : "按钮-改结算单位",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-confirmIssueInvoice",
                                "resourceName" : "按钮-确认开票",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-confirmNotIssueInvoice",
                                "resourceName" : "按钮-确认不开票",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-feeClosedModifyFee",
                                "resourceName" : "按钮-关账调费",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-createSettlement",
                                "resourceName" : "按钮-生成结算单",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-generateBill",
                                "resourceName" : "按钮-生成账单",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-setAgentCompany",
                                "resourceName" : "按钮-费用代收付",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-cancelAgentCompany",
                                "resourceName" : "按钮-撤销费用代收付",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-confirmOrderFeeReceive",
                                "resourceName" : "按钮-应收确认",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-cancleConfirmOrderFeeReceive",
                                "resourceName" : "按钮-撤销应收确认",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-confirmOrderFeePay",
                                "resourceName" : "按钮-应付确认",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-cancleConfirmOrderFeePay",
                                "resourceName" : "按钮-撤销应付确认",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-addReceive",
                                "resourceName" : "按钮-新增应收费用",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-addPay",
                                "resourceName" : "按钮-新增应付费用",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-edit",
                                "resourceName" : "按钮-修改",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-rowDelete",
                                "resourceName" : "操作-删除",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-rowCopy",
                                "resourceName" : "操作-复制",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             }
                          ],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "tab-specialManagementFee",
                          "resourceName" : "tab-专项管理",
                          "resourceType" : "module",
                          "subResource" : [
                             {
                                "auth" : "yes",
                                "resourceCode" : "page-show",
                                "resourceName" : "基本信息",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-createSettlement",
                                "resourceName" : "按钮-生成结算单",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-confirmOrderFeePay",
                                "resourceName" : "按钮-应付确认 ",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-cancleConfirmOrderFeePay",
                                "resourceName" : "按钮-撤销应付确认",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-feeClosedModifyFee",
                                "resourceName" : "按钮-关账调费",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-addPay",
                                "resourceName" : "按钮-新增应付费用",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-edit",
                                "resourceName" : "按钮-修改",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-rowDelete",
                                "resourceName" : "操作-删除",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             }
                          ],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "tab-managementFee",
                          "resourceName" : "tab-管理费",
                          "resourceType" : "module",
                          "subResource" : [
                             {
                                "auth" : "yes",
                                "resourceCode" : "page-show",
                                "resourceName" : "基本信息",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-createSettlement",
                                "resourceName" : "按钮-生成结算单",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             }
                          ],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "tab-exceptionFee",
                          "resourceName" : "tab-异常费用",
                          "resourceType" : "module",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "tab-feeClosedModifyFee",
                          "resourceName" : "tab-关账调费记录",
                          "resourceType" : "module",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "tab-bill",
                          "resourceName" : "tab-账单",
                          "resourceType" : "module",
                          "subResource" : [
                             {
                                "auth" : "yes",
                                "resourceCode" : "page-show",
                                "resourceName" : "基本信息",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-invoiceConfirm",
                                "resourceName" : "按钮-确认开票",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-invoiceConfirmNot",
                                "resourceName" : "按钮-确认不开票",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-createSettlement",
                                "resourceName" : "按钮-生成结算单",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-customerConfirm",
                                "resourceName" : "按钮-客户确认",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             }
                          ],
                          "type" : "role"
                       }
                    ],
                    "type" : "role"
                 },
                 {
                    "auth" : "yes",
                    "resourceCode" : "route-SiDetailFee",
                    "resourceName" : "补料详情费用",
                    "resourceType" : "module",
                    "subResource" : [
                       {
                          "auth" : "yes",
                          "resourceCode" : "tab-totalFee",
                          "resourceName" : "tab-全部费用",
                          "resourceType" : "module",
                          "subResource" : [
                             {
                                "auth" : "yes",
                                "resourceCode" : "page-show",
                                "resourceName" : "基本信息",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-createSettlement",
                                "resourceName" : "按钮-生成结算单",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             }
                          ],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "tab-businessFee",
                          "resourceName" : "tab-业务费用",
                          "resourceType" : "module",
                          "subResource" : [
                             {
                                "auth" : "yes",
                                "resourceCode" : "page-show",
                                "resourceName" : "基本信息",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-openSaveTemplate",
                                "resourceName" : "按钮-另存模板",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-selectTemplate",
                                "resourceName" : "按钮-选择模板导入",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-modifySettleUnit",
                                "resourceName" : "按钮-改结算单位",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-confirmIssueInvoice",
                                "resourceName" : "按钮-确认开票",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-confirmNotIssueInvoice",
                                "resourceName" : "按钮-确认不开票",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-feeClosedModifyFee",
                                "resourceName" : "按钮-关账调费",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-createSettlement",
                                "resourceName" : "按钮-生成结算单",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-generateBill",
                                "resourceName" : "按钮-生成账单",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-setAgentCompany",
                                "resourceName" : "按钮-费用代收付",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-cancelAgentCompany",
                                "resourceName" : "按钮-撤销费用代收付",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-confirmOrderFeeReceive",
                                "resourceName" : "按钮-应收确认",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-cancleConfirmOrderFeeReceive",
                                "resourceName" : "按钮-撤销应收确认",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-confirmOrderFeePay",
                                "resourceName" : "按钮-应付确认",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-cancleConfirmOrderFeePay",
                                "resourceName" : "按钮-撤销应付确认",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-addReceive",
                                "resourceName" : "按钮-新增应收费用",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-addPay",
                                "resourceName" : "按钮-新增应付费用",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-edit",
                                "resourceName" : "按钮-修改",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-rowDelete",
                                "resourceName" : "操作-删除",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-rowCopy",
                                "resourceName" : "操作-复制",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             }
                          ],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "tab-specialManagementFee",
                          "resourceName" : "tab-专项管理",
                          "resourceType" : "module",
                          "subResource" : [
                             {
                                "auth" : "yes",
                                "resourceCode" : "page-show",
                                "resourceName" : "基本信息",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-createSettlement",
                                "resourceName" : "按钮-生成结算单",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-confirmOrderFeePay",
                                "resourceName" : "按钮-应付确认",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-cancleConfirmOrderFeePay",
                                "resourceName" : "按钮-撤销应付确认",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-feeClosedModifyFee",
                                "resourceName" : "按钮-关账调费",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-addPay",
                                "resourceName" : "按钮-新增应付费用",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-edit",
                                "resourceName" : "按钮-修改",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-rowDelete",
                                "resourceName" : "操作-删除",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             }
                          ],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "tab-managementFee",
                          "resourceName" : "tab-管理费",
                          "resourceType" : "module",
                          "subResource" : [
                             {
                                "auth" : "yes",
                                "resourceCode" : "page-show",
                                "resourceName" : "基本信息",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-createSettlement",
                                "resourceName" : "按钮-生成结算单",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             }
                          ],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "tab-exceptionFee",
                          "resourceName" : "tab-异常费用",
                          "resourceType" : "module",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "tab-feeClosedModifyFee",
                          "resourceName" : "tab-关账调费记录",
                          "resourceType" : "module",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "tab-bill",
                          "resourceName" : "tab-账单",
                          "resourceType" : "module",
                          "subResource" : [
                             {
                                "auth" : "yes",
                                "resourceCode" : "page-show",
                                "resourceName" : "基本信息",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-invoiceConfirm",
                                "resourceName" : "按钮-确认开票",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-invoiceConfirmNot",
                                "resourceName" : "按钮-确认不开票",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-createSettlement",
                                "resourceName" : "按钮-生成结算单",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-customerConfirm",
                                "resourceName" : "按钮-客户确认",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             }
                          ],
                          "type" : "role"
                       }
                    ],
                    "type" : "role"
                 },
                 {
                    "auth" : "yes",
                    "resourceCode" : "OtherFeeList",
                    "resourceName" : "订单费用",
                    "resourceType" : "menu",
                    "subResource" : [
                       {
                          "auth" : "yes",
                          "resourceCode" : "FeeClosedModifyFeeList",
                          "resourceName" : "调费申请列表",
                          "resourceType" : "menu",
                          "subResource" : [
                             {
                                "auth" : "yes",
                                "resourceCode" : "page-show",
                                "resourceName" : "基本信息",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-showDetail",
                                "resourceName" : "操作-详情",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "route-FeeClosedModifyFeeDetail",
                                "resourceName" : "调费申请详情",
                                "resourceType" : "module",
                                "subResource" : [
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "page-show",
                                      "resourceName" : "基本信息",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-preSubmitPass",
                                      "resourceName" : "审核通过",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-preSubmitRefuse",
                                      "resourceName" : "审核拒绝",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   }
                                ],
                                "type" : "role"
                             }
                          ],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "MySpecialList",
                          "resourceName" : "专项管理费",
                          "resourceType" : "menu",
                          "subResource" : [
                             {
                                "auth" : "yes",
                                "resourceCode" : "page-show",
                                "resourceName" : "基本信息",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-createSettlement",
                                "resourceName" : "按钮-生成结算单",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             }
                          ],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "BillList",
                          "resourceName" : "账单列表",
                          "resourceType" : "menu",
                          "subResource" : [
                             {
                                "auth" : "yes",
                                "resourceCode" : "page-show",
                                "resourceName" : "基本信息",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-invoiceConfirm",
                                "resourceName" : "按钮-确认开票",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-invoiceConfirmNot",
                                "resourceName" : "按钮-确认不开票",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-createSettlement",
                                "resourceName" : "按钮-生成结算单",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-customerConfirm",
                                "resourceName" : "按钮-客户确认",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-showDetail",
                                "resourceName" : "操作-详情",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "route-BillDetail",
                                "resourceName" : "页面-账单详情",
                                "resourceType" : "module",
                                "subResource" : [
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "page-show",
                                      "resourceName" : "基本信息",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-export",
                                      "resourceName" : "按钮-导出",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-email",
                                      "resourceName" : "按钮-邮件",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-print",
                                      "resourceName" : "按钮-打印",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   }
                                ],
                                "type" : "role"
                             }
                          ],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "SeaCommerceList",
                          "resourceName" : "海运商务",
                          "resourceType" : "menu",
                          "subResource" : [
                             {
                                "auth" : "yes",
                                "resourceCode" : "tab-confirmBillList",
                                "resourceName" : "tab-账单确认",
                                "resourceType" : "module",
                                "subResource" : [
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "page-show",
                                      "resourceName" : "基本信息",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-shBillConfirmFnPass",
                                      "resourceName" : "按钮-确认成功",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-shBillConfirmFnRefuse",
                                      "resourceName" : "按钮-确认失败",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-addBillDialog",
                                      "resourceName" : "按钮-添加专项费用",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   }
                                ],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "tab-summaryBillList",
                                "resourceName" : "tab-月度汇总",
                                "resourceType" : "module",
                                "subResource" : [
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "page-show",
                                      "resourceName" : "基本信息",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-goPaymentRequest",
                                      "resourceName" : "按钮-付款申请",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-goBlancaLoss",
                                      "resourceName" : "按钮-亏损对冲",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   }
                                ],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "tab-commerceSettlementBillList",
                                "resourceName" : "tab-结算申请",
                                "resourceType" : "module",
                                "subResource" : [
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "page-show",
                                      "resourceName" : "基本信息",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-confirmPass",
                                      "resourceName" : "按钮-审核通过",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-confirmReject",
                                      "resourceName" : "按钮-审核拒绝",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   }
                                ],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "tab-hedgeBillList",
                                "resourceName" : "tab-亏损对冲",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             }
                          ],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "SettlementBillMergeList",
                          "resourceName" : "对账单合并",
                          "resourceType" : "menu",
                          "subResource" : [
                             {
                                "auth" : "yes",
                                "resourceCode" : "page-show",
                                "resourceName" : "基本信息",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-importSettlementBill",
                                "resourceName" : "按钮-导入客户账单",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             }
                          ],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "WriteoffDzgMonitor",
                          "resourceName" : "大掌柜核销",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       }
                    ],
                    "type" : "role"
                 },
                 {
                    "auth" : "yes",
                    "resourceCode" : "Settlement",
                    "resourceName" : "结算单",
                    "resourceType" : "menu",
                    "subResource" : [
                       {
                          "auth" : "yes",
                          "resourceCode" : "SettlementFeeList",
                          "resourceName" : "费用列表",
                          "resourceType" : "menu",
                          "subResource" : [
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-createSettleMulti",
                                "resourceName" : "按钮-生成多个结算单",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-createSettle",
                                "resourceName" : "按钮-生成结算单",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-export",
                                "resourceName" : "按钮-导出",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-confirmFee",
                                "resourceName" : "按钮-费用确认",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-setAgentCompany",
                                "resourceName" : "按钮-费用代收付",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-cancelAgentCompany",
                                "resourceName" : "按钮-撤销费用代收付",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "page-show",
                                "resourceName" : "基本信息",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             }
                          ],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "SettlementList",
                          "resourceName" : "结算单列表",
                          "resourceType" : "menu",
                          "subResource" : [
                             {
                                "auth" : "yes",
                                "resourceCode" : "show-page",
                                "resourceName" : "基本信息",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-delSettle",
                                "resourceName" : "按钮-删除结算单",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-confirmSettle",
                                "resourceName" : "按钮-确认结算单",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-cancelConfirm",
                                "resourceName" : "按钮-撤销确认结算单",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-exportBill",
                                "resourceName" : "按钮-导出对账单",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-hedging",
                                "resourceName" : "按钮-集团对冲",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-merge",
                                "resourceName" : "按钮-合并结算单",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-applyInvoice",
                                "resourceName" : "按钮-开票申请",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-applyPay",
                                "resourceName" : "按钮-付款申请",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-feeAgent",
                                "resourceName" : "按钮-费用代收付",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-feeAgentCancel",
                                "resourceName" : "按钮-撤销费用代收付",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-detail",
                                "resourceName" : "操作-详情",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "route-SettlementDetail",
                                "resourceName" : "页面-结算详情",
                                "resourceType" : "module",
                                "subResource" : [
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-delSettle",
                                      "resourceName" : "按钮-删除结算单",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-confirmSettle",
                                      "resourceName" : "按钮-确认结算单",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-cancelConfirm",
                                      "resourceName" : "按钮-撤销确认结算单",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-exportBill",
                                      "resourceName" : "按钮-导出对账单",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-billList",
                                      "resourceName" : "按钮-对账单列表",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-invoiceConfirm",
                                      "resourceName" : "按钮-确认开票",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-invoiceConfirmNo",
                                      "resourceName" : "按钮-确认不开票",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-addFee",
                                      "resourceName" : "按钮-添加费用",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-applyBad",
                                      "resourceName" : "按钮-坏账申请",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-applyPay",
                                      "resourceName" : "按钮-付款申请",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-applyInvoice",
                                      "resourceName" : "按钮-开票申请",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : " btn-exchangeRate",
                                      "resourceName" : "按钮-修改汇率",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-hedging",
                                      "resourceName" : "按钮-对冲申请",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-uploadOrder",
                                      "resourceName" : "按钮-上传客户水单",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-interTransApply",
                                      "resourceName" : "按钮-内部转移对冲",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-orderEdit",
                                      "resourceName" : "操作-编辑(水单)",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-orderDel",
                                      "resourceName" : "操作-删除(水单)",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "page-show",
                                      "resourceName" : "基本信息",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   }
                                ],
                                "type" : "role"
                             }
                          ],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "FinBillList",
                          "resourceName" : "费用单列表",
                          "resourceType" : "menu",
                          "subResource" : [
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-add",
                                "resourceName" : "按钮-新增费用单",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-detail",
                                "resourceName" : "操作-详情",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "route-FinBillListDetail",
                                "resourceName" : "页面-费用单详情",
                                "resourceType" : "module",
                                "subResource" : [
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-createSettle",
                                      "resourceName" : "按钮-生成结算单",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-close",
                                      "resourceName" : "按钮-关账调费",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-sureReceive",
                                      "resourceName" : "按钮-应收确认",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-addReceive",
                                      "resourceName" : "按钮-新增应收费用",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-surePay",
                                      "resourceName" : "按钮-应付确认",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-addPay",
                                      "resourceName" : "按钮-新增应付费用",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   }
                                ],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "page-show",
                                "resourceName" : "基本信息",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             }
                          ],
                          "type" : "role"
                       }
                    ],
                    "type" : "role"
                 },
                 {
                    "auth" : "yes",
                    "resourceCode" : "Gedging",
                    "resourceName" : "对冲",
                    "resourceType" : "menu",
                    "subResource" : [
                       {
                          "auth" : "yes",
                          "resourceCode" : "GedgingList",
                          "resourceName" : "对冲申请",
                          "resourceType" : "menu",
                          "subResource" : [
                             {
                                "resourceName" : "tab-对冲申请",
                                "auth" : "yes",
                                "resourceCode" : "tab-gedgingList",
                                "resourceType" : "module",
                                "subResource" : [
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "page-show",
                                      "resourceName" : "基本信息",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-detail",
                                      "resourceName" : "操作-详情",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "route-GedgingDetail",
                                      "resourceName" : "页面-对冲详情",
                                      "resourceType" : "module",
                                      "subResource" : [
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-pass",
                                            "resourceName" : "按钮-审核通过并核销",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-refuse",
                                            "resourceName" : "按钮-审核不通过",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "page-show",
                                            "resourceName" : "基本信息",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         }
                                      ],
                                      "type" : "role"
                                   }
                                ],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "tab-gedgingWriteOffList",
                                "resourceName" : "tab-对冲核销",
                                "resourceType" : "module",
                                "subResource" : [
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-unlock",
                                      "resourceName" : "按钮-核销解锁",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-reverse",
                                      "resourceName" : "按钮-反核销",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-confirmWriteoff",
                                      "resourceName" : "按钮-核销复核",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-voucherView",
                                      "resourceName" : "按钮-预览凭证",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-voucherCreate",
                                      "resourceName" : "按钮-生成凭证",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-voucherDel",
                                      "resourceName" : "按钮-删除凭证",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-detail",
                                      "resourceName" : "操作-详情",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "page-show",
                                      "resourceName" : "基本信息",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   }
                                ],
                                "type" : "role"
                             }
                          ],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "SettleOrderBaddebtList",
                          "resourceName" : "坏账申请列表",
                          "resourceType" : "menu",
                          "subResource" : [
                             {
                                "auth" : "yes",
                                "resourceCode" : "tab-baddeList",
                                "resourceName" : "tab-坏账申请",
                                "resourceType" : "module",
                                "subResource" : [
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-unlock",
                                      "resourceName" : "按钮-核销解锁",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-reverse",
                                      "resourceName" : "按钮-反核销",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-confirmWriteoff",
                                      "resourceName" : "按钮-核销复核",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-voucherView",
                                      "resourceName" : "按钮-预览凭证",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-voucherCreate",
                                      "resourceName" : "按钮-生成凭证",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-voucherDel",
                                      "resourceName" : "按钮-删除凭证",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-pass",
                                      "resourceName" : "按钮-审核通过",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-refuse",
                                      "resourceName" : "按钮-审核拒绝",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-detail",
                                      "resourceName" : "操作-详情",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "route-BadApplyDetail",
                                      "resourceName" : "页面-坏账申请详情",
                                      "resourceType" : "module",
                                      "subResource" : [
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "page-show",
                                            "resourceName" : "基本信息",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-auditRefuse",
                                            "resourceName" : "按钮-审批拒绝",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-auditPass",
                                            "resourceName" : "按钮-审批通过",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         }
                                      ],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "route-SettleOrderBadDetail",
                                      "resourceName" : "页面-坏账核销详情",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "route-SettleOrderBadApply",
                                      "resourceName" : "页面-坏账申请",
                                      "resourceType" : "module",
                                      "subResource" : [
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "page-show",
                                            "resourceName" : "基本信息",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-apply",
                                            "resourceName" : "按钮-提交申请",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         }
                                      ],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "show-page",
                                      "resourceName" : "基本信息",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   }
                                ],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "tab-settleOrder",
                                "resourceName" : "tab-坏账预销单",
                                "resourceType" : "module",
                                "subResource" : [
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-voucherView",
                                      "resourceName" : "按钮-预览扣除凭证",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-voucherCreate",
                                      "resourceName" : "按钮-生成扣除凭证",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-voucherDel",
                                      "resourceName" : "按钮-删除扣除凭证",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-detail",
                                      "resourceName" : "操作-详情",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "route-BadOrderDetail",
                                      "resourceName" : "页面-坏账预销单详情",
                                      "resourceType" : "module",
                                      "subResource" : [
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-voucherDel",
                                            "resourceName" : "按钮-删除扣除凭证",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-voucherCreate",
                                            "resourceName" : "按钮-生成扣除凭证 ",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-voucherView",
                                            "resourceName" : "按钮-预览扣除凭证 ",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "page-show",
                                            "resourceName" : "基本信息",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         }
                                      ],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "show-page",
                                      "resourceName" : "基本信息",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   }
                                ],
                                "type" : "role"
                             }
                          ],
                          "type" : "role"
                       }
                    ],
                    "type" : "role"
                 },
                 {
                    "auth" : "yes",
                    "resourceCode" : "Receivable",
                    "resourceName" : "应收",
                    "resourceType" : "menu",
                    "subResource" : [
                       {
                          "auth" : "yes",
                          "resourceCode" : "RegWriteoff",
                          "resourceName" : "收款登记",
                          "resourceType" : "menu",
                          "subResource" : [
                             {
                                "auth" : "yes",
                                "resourceCode" : "tab-regList",
                                "resourceName" : "tab-收款登记",
                                "resourceType" : "module",
                                "subResource" : [
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "route-RegDetail",
                                      "resourceName" : "页面-收款登记详情",
                                      "resourceType" : "module",
                                      "subResource" : [
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-writeoffRecv",
                                            "resourceName" : "按钮-收款核销",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-uploadBankseqFile",
                                            "resourceName" : "按钮-上传水单",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-handleConfirm",
                                            "resourceName" : "按钮-确认收款登记",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-addFee",
                                            "resourceName" : "按钮-添加手续费",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-editFee",
                                            "resourceName" : "操作-编辑",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-deleteFee",
                                            "resourceName" : "操作-删除 ",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "page-show",
                                            "resourceName" : "基本信息",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         }
                                      ],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-writeoffRecv",
                                      "resourceName" : "按钮-收款核销",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "route-WriteoffRecvDetail",
                                      "resourceName" : "页面-收款核销",
                                      "resourceType" : "module",
                                      "subResource" : [
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-uploadBankseqFile",
                                            "resourceName" : "按钮-上传水单",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-handleSettleCrop",
                                            "resourceName" : "按钮-关联委托结算单位",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-handleInvoice",
                                            "resourceName" : "按钮-关联发票核销",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-handleFeeList",
                                            "resourceName" : "按钮-关联费用核销",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-handleOrderList",
                                            "resourceName" : "按钮-关联结算单核销",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-writeoff",
                                            "resourceName" : "按钮-核销",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-transferDzg",
                                            "resourceName" : "按钮-余额转大掌柜",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "page-show",
                                            "resourceName" : "基本信息",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         }
                                      ],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-import",
                                      "resourceName" : "按钮-批量导入",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-transferPre",
                                      "resourceName" : "按钮-批量转预收",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-refund",
                                      "resourceName" : "按钮-申请退款",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-sureReceive",
                                      "resourceName" : "按钮-确认收款",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-cancelSure",
                                      "resourceName" : "按钮-撤销确认",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-delete",
                                      "resourceName" : "按钮-删除",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-detail",
                                      "resourceName" : "操作-详情",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-edit",
                                      "resourceName" : "操作-修改",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "page-show",
                                      "resourceName" : "基本信息",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-addReg",
                                      "resourceName" : "按钮-新增",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   }
                                ],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "tab-prerevList",
                                "resourceName" : "tab-预收款",
                                "resourceType" : "module",
                                "subResource" : [
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "page-show",
                                      "resourceName" : "基本信息",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "route-PrerevWriteoff",
                                      "resourceName" : "页面-预收款核销",
                                      "resourceType" : "module",
                                      "subResource" : [
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-transferDzg",
                                            "resourceName" : "按钮-余额转大掌柜",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "Receivable_Yyzk",
                                            "resourceName" : "按钮-上传水单（此按钮应该在收款登记详情页面）",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-getRefSettleUnitList",
                                            "resourceName" : "按钮-关联委托结算单位",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-listInvoiceReceivable",
                                            "resourceName" : "按钮-关联发票核销",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-settleOrderFeeList",
                                            "resourceName" : "按钮-关联费用核销",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-settleOrderList",
                                            "resourceName" : "按钮-关联结算单核销",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-writeoff",
                                            "resourceName" : "按钮-核销",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-invoiceApply",
                                            "resourceName" : "按钮-开票申请(废除，在核销详情内)",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-reviewWriteoff",
                                            "resourceName" : "按钮-确认复核(废除，在核销详情内)",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-addFee",
                                            "resourceName" : "按钮-添加手续费",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "page-show",
                                            "resourceName" : "基本信息",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         }
                                      ],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-preWriteoff",
                                      "resourceName" : "按钮-预收款核销",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "route-PrerevDetail",
                                      "resourceName" : "页面-预收款详情",
                                      "resourceType" : "module",
                                      "subResource" : [
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "page-show",
                                            "resourceName" : "基本信息",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-preWriteoff",
                                            "resourceName" : "按钮-预收款核销",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-transfer",
                                            "resourceName" : "按钮-转移结算单位",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         }
                                      ],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-refund",
                                      "resourceName" : "按钮-申请退款",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   }
                                ],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "tab-writeoffRecvList",
                                "resourceName" : "tab-收款核销",
                                "resourceType" : "module",
                                "subResource" : [
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-applyInvoice",
                                      "resourceName" : "按钮-开票申请",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-unlockWriteoff",
                                      "resourceName" : "按钮-复核解锁",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-reverseWriteoff",
                                      "resourceName" : "按钮-反核销",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-toReWriteoff",
                                      "resourceName" : "按钮-重新核销",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-voucherView",
                                      "resourceName" : "按钮-预览凭证",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-voucherCreate",
                                      "resourceName" : "按钮-生成凭证",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-voucherDel",
                                      "resourceName" : "按钮-删除凭证",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-detail",
                                      "resourceName" : "操作-收款核销详情",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "route-WriteoffRecvDetail2",
                                      "resourceName" : "页面-收款核销详情",
                                      "resourceType" : "module",
                                      "subResource" : [
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-reverseWriteoff",
                                            "resourceName" : "按钮-反核销",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-toReWriteoff",
                                            "resourceName" : "按钮-重新核销",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-applyInvoice",
                                            "resourceName" : "按钮-开票申请",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-voucherView",
                                            "resourceName" : "按钮-预览凭证",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-voucherCreate",
                                            "resourceName" : "按钮-生成凭证",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-voucherDel",
                                            "resourceName" : "按钮-删除凭证",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-recheck",
                                            "resourceName" : "按钮-确认复核",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "page-show",
                                            "resourceName" : "基本信息",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         }
                                      ],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-export",
                                      "resourceName" : "按钮-导出",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "page-show",
                                      "resourceName" : "基本信息",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   }
                                ],
                                "type" : "role"
                             }
                          ],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "RegTransfer",
                          "resourceName" : "收款转移",
                          "resourceType" : "menu",
                          "subResource" : [
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-auditPass",
                                "resourceName" : "按钮-审批通过",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-auditRefuse",
                                "resourceName" : "按钮-审批拒绝 ",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "page-show",
                                "resourceName" : "基本信息",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             }
                          ],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "InvoiceReceivable",
                          "resourceName" : "应收发票管理",
                          "resourceType" : "menu",
                          "subResource" : [
                             {
                                "auth" : "yes",
                                "resourceCode" : "tab-invoiceReceivableApplyList",
                                "resourceName" : "tab-开票申请",
                                "resourceType" : "module",
                                "subResource" : [
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-closeApply",
                                      "resourceName" : "按钮-关闭申请",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-manualRegistInvoice",
                                      "resourceName" : "按钮-手填发票",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-batchPrintCreate",
                                      "resourceName" : "按钮-批量打印",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-createElectronic",
                                      "resourceName" : "按钮-电子票生成",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-preApply",
                                      "resourceName" : "按钮-预收款开票申请",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-detail",
                                      "resourceName" : "操作-详情 ",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "route-InvoiceReceivableApplyDetail",
                                      "resourceName" : "页面-开票申请详情 ",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "page-show",
                                      "resourceName" : "基本信息",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   }
                                ],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "tab-invoicePrerevList",
                                "resourceName" : "tab-预收款开票审核",
                                "resourceType" : "module",
                                "subResource" : [
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-auditPass",
                                      "resourceName" : "按钮-审核通过",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-auditRefuse",
                                      "resourceName" : "按钮-审核拒绝",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-detail",
                                      "resourceName" : "操作-详情 ",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "route-InvoicePrerevDetail",
                                      "resourceName" : "页面-预收款开票详情",
                                      "resourceType" : "module",
                                      "subResource" : [
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "page-show",
                                            "resourceName" : "基本信息",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-auditPass",
                                            "resourceName" : "按钮-审核通过",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-auditRefuse",
                                            "resourceName" : "按钮-审核拒绝",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         }
                                      ],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "page-show",
                                      "resourceName" : " 基本信息",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   }
                                ],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "tab-invoiceReceivableList",
                                "resourceName" : "tab-发票列表",
                                "resourceType" : "module",
                                "subResource" : [
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-cancel",
                                      "resourceName" : "按钮-冲红作废",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-release",
                                      "resourceName" : "按钮-撤销关联",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-relate",
                                      "resourceName" : "按钮-关联结算单",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "page-show",
                                      "resourceName" : "基本信息",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-detail",
                                      "resourceName" : "操作-详情",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-print",
                                      "resourceName" : "操作-打印 ",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "route-InvoiceReceivableDetail",
                                      "resourceName" : "页面-发票详情",
                                      "resourceType" : "module",
                                      "subResource" : [
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "page-show",
                                            "resourceName" : "基本信息",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-exportFee",
                                            "resourceName" : "按钮-导出费用",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         }
                                      ],
                                      "type" : "role"
                                   }
                                ],
                                "type" : "role"
                             }
                          ],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "FiscalTermList",
                          "resourceName" : "应收账单",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       }
                    ],
                    "type" : "role"
                 },
                 {
                    "auth" : "yes",
                    "resourceCode" : "Pay",
                    "resourceName" : "应付",
                    "resourceType" : "menu",
                    "subResource" : [
                       {
                          "auth" : "yes",
                          "resourceCode" : "PrepayList",
                          "resourceName" : "付款申请",
                          "resourceType" : "menu",
                          "subResource" : [
                             {
                                "auth" : "yes",
                                "resourceCode" : "tab-settleList",
                                "resourceName" : "tab-结算付款",
                                "resourceType" : "module",
                                "subResource" : [
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-settlePass",
                                      "resourceName" : "按钮-审核通过",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-settleRefuse",
                                      "resourceName" : "按钮-审核拒绝",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-settlePushCashier",
                                      "resourceName" : "按钮-推送出纳",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-settleExport",
                                      "resourceName" : "按钮-导出",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-settlePrint",
                                      "resourceName" : "按钮-打印",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-settleMerge",
                                      "resourceName" : "按钮-合并付款",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "resourceName" : "按钮-拆分付款",
                                      "auth" : "yes",
                                      "resourceCode" : "btn-settlePaySeparately",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-settleRelationInvoice",
                                      "resourceName" : "按钮-关联发票",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-settleaddInvoice",
                                      "resourceName" : "按钮-发票登记",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-settleDownLoadInvoice",
                                      "resourceName" : "按钮-批量下载发票",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-detail",
                                      "resourceName" : "操作-详情",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "route-SettleDetail",
                                      "resourceName" : "结算付款申请详情",
                                      "resourceType" : "module",
                                      "subResource" : [
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-settlementPass",
                                            "resourceName" : "按钮-审批通过",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-settlementRefuse",
                                            "resourceName" : "按钮-审批拒绝",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-settlementRelevance",
                                            "resourceName" : "按钮-关联发票",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "page-show",
                                            "resourceName" : "基本信息",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         }
                                      ],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-handlePrints",
                                      "resourceName" : "按钮-打印专项单",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "page-show",
                                      "resourceName" : "基本信息",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   }
                                ],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "tab-prepayList",
                                "resourceName" : "tab-预付款",
                                "resourceType" : "module",
                                "subResource" : [
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-prepayPass",
                                      "resourceName" : "按钮-申请通过",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-prepayRefuse",
                                      "resourceName" : "按钮-申请拒绝",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-prepayPrepay",
                                      "resourceName" : "按钮-预付款申请",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-prepayExport",
                                      "resourceName" : "按钮-导出",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-prepayPrint",
                                      "resourceName" : "按钮-打印",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-prepayRelationInvoice",
                                      "resourceName" : "按钮-关联发票",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-prepayAddInvoice",
                                      "resourceName" : "按钮 -发票登记",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-prepayDownLoadInvoice",
                                      "resourceName" : "按钮-批量下载发票",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "route-PrepayDetail",
                                      "resourceName" : "预付款详情",
                                      "resourceType" : "module",
                                      "subResource" : [
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-prepayPass",
                                            "resourceName" : "按钮-申请通过",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-prepayRefuse",
                                            "resourceName" : "按钮-申请拒绝",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "page-show",
                                            "resourceName" : "基本信息",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         }
                                      ],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-detail",
                                      "resourceName" : "操作-详情",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "page-show",
                                      "resourceName" : "基本信息",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   }
                                ],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "tab-payApplyReceiveRefund",
                                "resourceName" : "tab-退款申请",
                                "resourceType" : "module",
                                "subResource" : [
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-payApplyReceiveRefundPass",
                                      "resourceName" : "按钮-申请通过",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-payApplyReceiveRefundRefuse",
                                      "resourceName" : "按钮-申请拒绝",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-detail",
                                      "resourceName" : "操作-详情",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "route-RefundDetail",
                                      "resourceName" : "退款申请详情",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "page-show",
                                      "resourceName" : "基本信息",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   }
                                ],
                                "type" : "role"
                             }
                          ],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "WriteoffPayList",
                          "resourceName" : "出纳付款",
                          "resourceType" : "menu",
                          "subResource" : [
                             {
                                "auth" : "yes",
                                "resourceCode" : "tab-orderList",
                                "resourceName" : "tab-付款单",
                                "resourceType" : "module",
                                "subResource" : [
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-orderRefusePay",
                                      "resourceName" : "按钮-拒绝付款",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-orderPrintCreate",
                                      "resourceName" : "按钮-标记受理",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-orderCanclePayOrder",
                                      "resourceName" : "按钮-撤销标记受理",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-orderExport",
                                      "resourceName" : "按钮-导出",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-orderPrint",
                                      "resourceName" : "按钮-打印",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-orderMerge",
                                      "resourceName" : "按钮-合并付款",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-orderRefund",
                                      "resourceName" : "按钮-预付退款",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-orderWriteOffPreview",
                                      "resourceName" : "按钮-付款核销",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-detail",
                                      "resourceName" : "操作-详情",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "route-OrderDetails",
                                      "resourceName" : "付款单详情",
                                      "resourceType" : "module",
                                      "subResource" : [
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-addExchange",
                                            "resourceName" : "按钮-添加购汇记录",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-markErr",
                                            "resourceName" : "按钮-标记付错",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-writeOffPreview",
                                            "resourceName" : "按钮-核销",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-changeRate",
                                            "resourceName" : "按钮-一键修改核销汇率",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-addFee",
                                            "resourceName" : "按钮-添加手续费",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-relevancePrepay",
                                            "resourceName" : "按钮-关联预付款",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "page-show",
                                            "resourceName" : "基本信息",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         }
                                      ],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "route-OrderRefund",
                                      "resourceName" : "预付退款",
                                      "resourceType" : "module",
                                      "subResource" : [
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-refundSubmit",
                                            "resourceName" : "按钮-确认",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "page-show",
                                            "resourceName" : "基本信息",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         }
                                      ],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "page-show",
                                      "resourceName" : "基本信息",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   }
                                ],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "tab-writeoffPayList",
                                "resourceName" : "tab-付款核销",
                                "resourceType" : "module",
                                "subResource" : [
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-writeoff",
                                      "resourceName" : "按钮-核销复核",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-writeoffUnlock",
                                      "resourceName" : "按钮-核销解锁",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-writeoffPayExport",
                                      "resourceName" : "按钮-导出",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-afreshWriteoff",
                                      "resourceName" : "按钮-重新核销",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-writeoffRollback",
                                      "resourceName" : "按钮-反核销",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-batchPrintCreate",
                                      "resourceName" : "按钮-预览凭证",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-Voucher",
                                      "resourceName" : "按钮-生成凭证",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-delVoucher",
                                      "resourceName" : "按钮-删除凭证",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-detail",
                                      "resourceName" : "操作-详情",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "route-WritePayDetail",
                                      "resourceName" : "付款核销详情",
                                      "resourceType" : "module",
                                      "subResource" : [
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-writeoffRollback",
                                            "resourceName" : "按钮-反核销",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-afreshWriteoff",
                                            "resourceName" : "按钮-重新核销",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-batchPrintCreate",
                                            "resourceName" : "按钮-预览凭证",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-voucherNo",
                                            "resourceName" : "按钮-生成凭证",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-delVoucher",
                                            "resourceName" : "按钮-删除凭证",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-writeoff",
                                            "resourceName" : "按钮-确认复核",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "page-show",
                                            "resourceName" : "基本信息",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         }
                                      ],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "page-show",
                                      "resourceName" : "基本信息",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   }
                                ],
                                "type" : "role"
                             }
                          ],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "InvoicePaymentList",
                          "resourceName" : "应付发票",
                          "resourceType" : "menu",
                          "subResource" : [
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-detail",
                                "resourceName" : "操作-详情",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-Edit",
                                "resourceName" : "操作-修改",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-delInovice",
                                "resourceName" : "按钮-删除发票",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-financeReceive",
                                "resourceName" : "按钮-财务已收",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-openRelatePayInfoDialog",
                                "resourceName" : "按钮-关联请款单",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-addInvoice",
                                "resourceName" : "按钮-发票登记",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "route-InvoicePaymentListDetail",
                                "resourceName" : "应付发票详情",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "page-show",
                                "resourceName" : "基本信息",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             }
                          ],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "SupplierBillList",
                          "resourceName" : "供应商对账",
                          "resourceType" : "menu",
                          "subResource" : [
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-supplierBillCompare",
                                "resourceName" : "按钮-导出模板",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "route-SupplierBillListDetail",
                                "resourceName" : "账单数据",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "page-show",
                                "resourceName" : "基本信息",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-importAction",
                                "resourceName" : "按钮-导入供应商账单",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-createSettlement2",
                                "resourceName" : "按钮-生成多个结算单",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-createSettlement",
                                "resourceName" : "按钮-生成结算单",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "route-SupplierBillListResult",
                                "resourceName" : "系统核对结果",
                                "resourceType" : "module",
                                "subResource" : [
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-createSettlement",
                                      "resourceName" : "按钮-生成结算单",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-createSettlement2",
                                      "resourceName" : "按钮-生成多个结算单",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-exportData",
                                      "resourceName" : "按钮-导出",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-checkDetail",
                                      "resourceName" : "按钮-查看系统明细数据",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "page-show",
                                      "resourceName" : "基本信息",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "route-SupplierBillListSystem",
                                      "resourceName" : "系统明细数据",
                                      "resourceType" : "module",
                                      "subResource" : [
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "page-show",
                                            "resourceName" : "基本信息",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         },
                                         {
                                            "auth" : "yes",
                                            "resourceCode" : "btn-exportData",
                                            "resourceName" : "按钮-导出",
                                            "resourceType" : "module",
                                            "subResource" : [],
                                            "type" : "role"
                                         }
                                      ],
                                      "type" : "role"
                                   }
                                ],
                                "type" : "role"
                             }
                          ],
                          "type" : "role"
                       }
                    ],
                    "type" : "role"
                 },
                 {
                    "auth" : "yes",
                    "resourceCode" : "OtherWriteOff",
                    "resourceName" : "员工扣减",
                    "resourceType" : "menu",
                    "subResource" : [
                       {
                          "auth" : "yes",
                          "resourceCode" : "EmplAbatementList",
                          "resourceName" : "扣减金额",
                          "resourceType" : "menu",
                          "subResource" : [
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-extract",
                                "resourceName" : "按钮-扣减提取",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-exportEmplAbatement",
                                "resourceName" : "按钮-导出",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "page-show",
                                "resourceName" : "基本信息",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             }
                          ],
                          "type" : "role"
                       }
                    ],
                    "type" : "role"
                 },
                 {
                    "auth" : "yes",
                    "resourceCode" : "Investor",
                    "resourceName" : "客商余额",
                    "resourceType" : "menu",
                    "subResource" : [
                       {
                          "auth" : "yes",
                          "resourceCode" : "InvestorPrepay",
                          "resourceName" : "预付余额",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "PrerevAccountListPage",
                          "resourceName" : "预收余额",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "SettleUnit",
                          "resourceName" : "结算单位",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       }
                    ],
                    "type" : "role"
                 },
                 {
                    "auth" : "yes",
                    "resourceCode" : "Voucher",
                    "resourceName" : "凭证",
                    "resourceType" : "menu",
                    "subResource" : [
                       {
                          "auth" : "yes",
                          "resourceCode" : "VoucherSetting",
                          "resourceName" : "凭证设置",
                          "resourceType" : "menu",
                          "subResource" : [
                             {
                                "auth" : "yes",
                                "resourceCode" : "tab-VS1",
                                "resourceName" : "tab-会计科目管理",
                                "resourceType" : "module",
                                "subResource" : [
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-add",
                                      "resourceName" : "按钮-新增",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-edit",
                                      "resourceName" : "操作-修改",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-async",
                                      "resourceName" : "按钮-同步金蝶",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "page-show",
                                      "resourceName" : "基本信息",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   }
                                ],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "tab-VS2",
                                "resourceName" : "tab-子科目匹配",
                                "resourceType" : "module",
                                "subResource" : [
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-add",
                                      "resourceName" : "按钮-新增",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-edit",
                                      "resourceName" : "操作-修改",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "page-show",
                                      "resourceName" : "基本信息",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   }
                                ],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "tab-VS3",
                                "resourceName" : "tab-账簿管理",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "tab-VS4",
                                "resourceName" : "tab-凭证字管理 ",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "tab-VS5",
                                "resourceName" : "tab-费用项科目管理",
                                "resourceType" : "module",
                                "subResource" : [
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-add",
                                      "resourceName" : "按钮-新增",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-edit",
                                      "resourceName" : "操作-修改",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "page-show",
                                      "resourceName" : "基本信息",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   }
                                ],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "tab-VS6",
                                "resourceName" : "tab-场景关联账簿",
                                "resourceType" : "module",
                                "subResource" : [
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-add",
                                      "resourceName" : "按钮-新增",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-edit",
                                      "resourceName" : "操作-修改",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "page-show",
                                      "resourceName" : "基本信息",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   }
                                ],
                                "type" : "role"
                             }
                          ],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "VoucherBusiness",
                          "resourceName" : "业务凭证",
                          "resourceType" : "menu",
                          "subResource" : [
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-add",
                                "resourceName" : "按钮-新增",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-edit",
                                "resourceName" : "操作-修改",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "page-show",
                                "resourceName" : "基本信息",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             }
                          ],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "VoucherManage",
                          "resourceName" : "凭证管理",
                          "resourceType" : "menu",
                          "subResource" : [
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-delete",
                                "resourceName" : "按钮-删除凭证",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-export",
                                "resourceName" : "按钮-导出",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "page-show",
                                "resourceName" : "基本信息",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             }
                          ],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "AccountBalance",
                          "resourceName" : "科目余额",
                          "resourceType" : "menu",
                          "subResource" : [
                             {
                                "auth" : "yes",
                                "resourceCode" : "tab-List",
                                "resourceName" : "tab-科目余额表",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "tab-ListDetail",
                                "resourceName" : "tab-科目余额明细表",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "tab-Dimension",
                                "resourceName" : "tab-核算维度余额表",
                                "resourceType" : "module",
                                "subResource" : [
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-export",
                                      "resourceName" : "按钮-导出",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "page-show",
                                      "resourceName" : "基本信息",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   }
                                ],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "tab-DimensionDetail",
                                "resourceName" : "tab-核算维度明细表",
                                "resourceType" : "module",
                                "subResource" : [
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-export",
                                      "resourceName" : "按钮-导出 ",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "page-show",
                                      "resourceName" : "基本信息 ",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   }
                                ],
                                "type" : "role"
                             }
                          ],
                          "type" : "role"
                       }
                    ],
                    "type" : "role"
                 },
                 {
                    "auth" : "yes",
                    "resourceCode" : "FinClose",
                    "resourceName" : "关账",
                    "resourceType" : "menu",
                    "subResource" : [
                       {
                          "auth" : "yes",
                          "resourceCode" : "PreClose",
                          "resourceName" : "预关账",
                          "resourceType" : "menu",
                          "subResource" : [
                             {
                                "auth" : "yes",
                                "resourceCode" : "tab-preClose1",
                                "resourceName" : "tab-预关账失败",
                                "resourceType" : "module",
                                "subResource" : [
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-multiApply",
                                      "resourceName" : "按钮-批量申请预关账",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-apply",
                                      "resourceName" : "操作-申请预关账",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-forceApply",
                                      "resourceName" : "按钮-按月预关账",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "page-show",
                                      "resourceName" : "基本信息",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   }
                                ],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "tab-preClose2",
                                "resourceName" : "tab-预关账失败审批",
                                "resourceType" : "module",
                                "subResource" : [
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-multiAudit",
                                      "resourceName" : "按钮-批量审批",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : " btn-export",
                                      "resourceName" : "按钮-导出",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-audit",
                                      "resourceName" : "操作-审批",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "page-show",
                                      "resourceName" : "基本信息",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   }
                                ],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "tab-preClose3",
                                "resourceName" : "tab-预关账成功",
                                "resourceType" : "module",
                                "subResource" : [
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-voucherCreate",
                                      "resourceName" : "按钮-生成转字凭证",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "btn-voucherDel",
                                      "resourceName" : "按钮-按月删除凭证",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   },
                                   {
                                      "auth" : "yes",
                                      "resourceCode" : "page-show",
                                      "resourceName" : "基本信息",
                                      "resourceType" : "module",
                                      "subResource" : [],
                                      "type" : "role"
                                   }
                                ],
                                "type" : "role"
                             }
                          ],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "TotalClose",
                          "resourceName" : "总关账",
                          "resourceType" : "menu",
                          "subResource" : [
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-totalClose",
                                "resourceName" : "按钮-总关账",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "page-show",
                                "resourceName" : "基本信息",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             }
                          ],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "FinDate",
                          "resourceName" : "财务日期",
                          "resourceType" : "menu",
                          "subResource" : [
                             {
                                "auth" : "yes",
                                "resourceCode" : "btn-edit",
                                "resourceName" : "操作-修改",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             },
                             {
                                "auth" : "yes",
                                "resourceCode" : "page-show",
                                "resourceName" : "基本信息",
                                "resourceType" : "module",
                                "subResource" : [],
                                "type" : "role"
                             }
                          ],
                          "type" : "role"
                       }
                    ],
                    "type" : "role"
                 }
              ],
              "type" : "role"
           },
           {
              "auth" : "yes",
              "resourceCode" : "AirTransport",
              "resourceName" : "空运",
              "resourceType" : "menu",
              "subResource" : [
                 {
                    "auth" : "yes",
                    "resourceCode" : "AirTransportOrder",
                    "resourceName" : "订单",
                    "resourceType" : "menu",
                    "subResource" : [
                       {
                          "auth" : "yes",
                          "resourceCode" : "AirTransportOrderList",
                          "resourceName" : "订单列表",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "AirTransportJointList",
                          "resourceName" : "协同订单",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "AirTransportBlFinApplyList",
                          "resourceName" : "放单申请列表",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "AirTransportBlFinList",
                          "resourceName" : "财务审核列表",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       }
                    ],
                    "type" : "role"
                 },
                 {
                    "auth" : "yes",
                    "resourceCode" : "AirTransportBook",
                    "resourceName" : "订舱",
                    "resourceType" : "menu",
                    "subResource" : [
                       {
                          "auth" : "yes",
                          "resourceCode" : "AirTransportBookShip",
                          "resourceName" : "订舱查询",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       }
                    ],
                    "type" : "role"
                 }
              ],
              "type" : "role"
           },
           {
              "auth" : "yes",
              "resourceCode" : "CRM",
              "resourceName" : "CRM",
              "resourceType" : "menu",
              "subResource" : [
                 {
                    "auth" : "yes",
                    "resourceCode" : "CustomerManage",
                    "resourceName" : "客户管理",
                    "resourceType" : "menu",
                    "subResource" : [
                       {
                          "auth" : "yes",
                          "resourceCode" : "CustomerList",
                          "resourceName" : "客户列表",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "CustomerReviewList",
                          "resourceName" : "客户审核列表",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "BdRemoveLog",
                          "resourceName" : "客户回收记录",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "VisitPlan",
                          "resourceName" : "拜访计划",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "FollowLog",
                          "resourceName" : "跟进记录",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "RecycleList",
                          "resourceName" : "公海列表",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                        "auth" : "yes",
                        "resourceCode" : "AnnualPlanList",
                        "resourceName" : "年度计划列表",
                        "resourceType" : "menu",
                        "subResource" : [],
                        "type" : "role"
                     }
                    ],
                    "type" : "role"
                 },
                 {
                    "auth" : "yes",
                    "resourceCode" : "MerchantManage",
                    "resourceName" : "供应商管理",
                    "resourceType" : "menu",
                    "subResource" : [
                       {
                          "auth" : "yes",
                          "resourceCode" : "SupplierList",
                          "resourceName" : "供应商列表",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "SupplierReviewList",
                          "resourceName" : "供应商审核列表",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       }
                    ],
                    "type" : "role"
                 },
                 {
                    "auth" : "yes",
                    "resourceCode" : "BlackList",
                    "resourceName" : "黑名单",
                    "resourceType" : "menu",
                    "subResource" : [],
                    "type" : "role"
                 }
              ],
              "type" : "role"
           },
           {
              "auth" : "yes",
              "resourceCode" : "Cosco",
              "resourceName" : "cosco",
              "resourceType" : "menu",
              "subResource" : [
                 {
                    "auth" : "yes",
                    "resourceCode" : "ExecCosco",
                    "resourceName" : "cosco",
                    "resourceType" : "menu",
                    "subResource" : [
                       {
                          "auth" : "yes",
                          "resourceCode" : "ShippingLineSearch",
                          "resourceName" : "航线查询",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "OrderSearch",
                          "resourceName" : "订单查询",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       }
                    ],
                    "type" : "role"
                 },
                 {
                    "auth" : "yes",
                    "resourceCode" : "BkgManage",
                    "resourceName" : "订舱管理",
                    "resourceType" : "menu",
                    "subResource" : [
                       {
                          "auth" : "yes",
                          "resourceCode" : "BookConfigure",
                          "resourceName" : "订舱配置",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "CoscoTask",
                          "resourceName" : "COSCO任务",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "MsgNotice",
                          "resourceName" : "消息通知",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       }
                    ],
                    "type" : "role"
                 }
              ],
              "type" : "role"
           },
           {
              "auth" : "yes",
              "resourceCode" : "CompanyResource",
              "resourceName" : "公司管理",
              "resourceType" : "menu",
              "subResource" : [
                 {
                    "auth" : "yes",
                    "resourceCode" : "Department",
                    "resourceName" : "组织架构",
                    "resourceType" : "menu",
                    "subResource" : [],
                    "type" : "role"
                 },
                 {
                    "auth" : "yes",
                    "resourceCode" : "BranchCompany",
                    "resourceName" : "分公司列表",
                    "resourceType" : "menu",
                    "subResource" : [],
                    "type" : "role"
                 },
                 {
                    "auth" : "yes",
                    "resourceCode" : "EmployeeTitle",
                    "resourceName" : "员工职务列表",
                    "resourceType" : "menu",
                    "subResource" : [],
                    "type" : "role"
                 },
                 {
                    "auth" : "yes",
                    "resourceCode" : "Employee",
                    "resourceName" : "员工列表",
                    "resourceType" : "menu",
                    "subResource" : [],
                    "type" : "role"
                 },
                 {
                    "auth" : "yes",
                    "resourceCode" : "Role",
                    "resourceName" : "角色列表",
                    "resourceType" : "menu",
                    "subResource" : [],
                    "type" : "role"
                 },
                 {
                    "auth" : "yes",
                    "resourceCode" : "SysUser",
                    "resourceName" : "系统用户列表",
                    "resourceType" : "menu",
                    "subResource" : [],
                    "type" : "role"
                 },
                 {
                    "auth" : "yes",
                    "resourceCode" : "JobAssign",
                    "resourceName" : "业务岗位配置",
                    "resourceType" : "menu",
                    "subResource" : [],
                    "type" : "role"
                 },
                 {
                    "auth" : "yes",
                    "resourceCode" : "CompanyBankAcct",
                    "resourceName" : "银行信息",
                    "resourceType" : "menu",
                    "subResource" : [],
                    "type" : "role"
                 }
              ],
              "type" : "role"
           },
           {
              "auth" : "yes",
              "resourceCode" : "Permission",
              "resourceName" : "权限配置",
              "resourceType" : "menu",
              "subResource" : [
                 {
                    "auth" : "yes",
                    "resourceCode" : "Function",
                    "resourceName" : "功能权限",
                    "resourceType" : "menu",
                    "subResource" : [
                       {
                          "auth" : "yes",
                          "resourceCode" : "Menu",
                          "resourceName" : "菜单列表",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       }
                    ],
                    "type" : "role"
                 },
                 {
                    "auth" : "yes",
                    "resourceCode" : "DataSet",
                    "resourceName" : "数据权限",
                    "resourceType" : "menu",
                    "subResource" : [
                       {
                          "auth" : "yes",
                          "resourceCode" : "Rule",
                          "resourceName" : "规则列表",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "Params",
                          "resourceName" : "参数列表",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "RuleGroup",
                          "resourceName" : "规则分组列表",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "RoleRule",
                          "resourceName" : "角色规则列表",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "GlobalPrivilege",
                          "resourceName" : "全局权限列表",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "ShippingLine",
                          "resourceName" : "航线分组列表",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "ShippingLineDept",
                          "resourceName" : "部门航线分配",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       }
                    ],
                    "type" : "role"
                 }
              ],
              "type" : "role"
           },
           {
              "auth" : "yes",
              "resourceCode" : "BaseData",
              "resourceName" : "基础数据",
              "resourceType" : "menu",
              "subResource" : [
                 {
                    "auth" : "yes",
                    "resourceCode" : "CommonData",
                    "resourceName" : "通用基础数据",
                    "resourceType" : "menu",
                    "subResource" : [
                       {
                          "auth" : "yes",
                          "resourceCode" : "Currency",
                          "resourceName" : "币别信息",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "ExchangeRate",
                          "resourceName" : "汇率配置",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "ExchangeRateConfig",
                          "resourceName" : "查看汇率",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "TaxRate",
                          "resourceName" : "税率配置",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "FeeItem",
                          "resourceName" : "费用项",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "SpecialFeeitemLimit",
                          "resourceName" : "专项管理费用",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "CompanyBankAcct",
                          "resourceName" : "银行信息",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "Country",
                          "resourceName" : "国家",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "City",
                          "resourceName" : "城市",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "Holiday",
                          "resourceName" : "节假日",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "Dict",
                          "resourceName" : "数据字典",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "BaseConfig",
                          "resourceName" : "系统配置项",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       }
                    ],
                    "type" : "role"
                 },
                 {
                    "auth" : "yes",
                    "resourceCode" : "ShippingData",
                    "resourceName" : "海运基础信息",
                    "resourceType" : "menu",
                    "subResource" : [
                       {
                          "auth" : "yes",
                          "resourceCode" : "Port",
                          "resourceName" : "海运港口",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "SystemLine",
                          "resourceName" : "海运航线",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "ShippingCarrier",
                          "resourceName" : "船司信息",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "ShipTerms",
                          "resourceName" : "运输条款",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       }
                    ],
                    "type" : "role"
                 }
              ],
              "type" : "role"
           },
           {
              "auth" : "yes",
              "resourceCode" : "BKG",
              "resourceName" : "商务订舱",
              "resourceType" : "menu",
              "subResource" : [
                 {
                    "auth" : "yes",
                    "resourceCode" : "BkgSaleConfig",
                    "resourceName" : "业务配置",
                    "resourceType" : "menu",
                    "subResource" : [],
                    "type" : "role"
                 },
                 {
                    "auth" : "yes",
                    "resourceCode" : "CastManage",
                    "resourceName" : "舱位预测",
                    "resourceType" : "menu",
                    "subResource" : [
                       {
                          "auth" : "yes",
                          "resourceCode" : "BkgForeCastLine",
                          "resourceName" : "商务预报",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "ApplyForeCastLine",
                          "resourceName" : "预报申领",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "ForecastStatistic",
                          "resourceName" : "预测汇总",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "BusinessCast",
                          "resourceName" : "预测审批",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "ForeCast",
                          "resourceName" : "舱位预测",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       }
                    ],
                    "type" : "role"
                 },
                 {
                    "auth" : "yes",
                    "resourceCode" : "StockManage",
                    "resourceName" : "现舱管理",
                    "resourceType" : "menu",
                    "subResource" : [
                       {
                          "auth" : "yes",
                          "resourceCode" : "BkgStockApply",
                          "resourceName" : "现舱申领",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "StatisticList",
                          "resourceName" : "现舱发布",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       }
                    ],
                    "type" : "role"
                 },
                 {
                    "auth" : "yes",
                    "resourceCode" : "ApplyManage",
                    "resourceName" : "申领管理",
                    "resourceType" : "menu",
                    "subResource" : [
                       {
                          "auth" : "yes",
                          "resourceCode" : "BkgStockManage",
                          "resourceName" : "申领审批",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "StockReturn",
                          "resourceName" : "退舱列表",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "BkgApplyManage",
                          "resourceName" : "申领管理",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       }
                    ],
                    "type" : "role"
                 },
                 {
                    "auth" : "yes",
                    "resourceCode" : "BkgNoticeList",
                    "resourceName" : "系统消息",
                    "resourceType" : "menu",
                    "subResource" : [],
                    "type" : "role"
                 },
                 {
                    "auth" : "yes",
                    "resourceCode" : "NoticeManage",
                    "resourceName" : "消息管理",
                    "resourceType" : "menu",
                    "subResource" : [
                       {
                          "auth" : "yes",
                          "resourceCode" : "BkgNoticeManage",
                          "resourceName" : "消息发布",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       },
                       {
                          "auth" : "yes",
                          "resourceCode" : "BkgManageList",
                          "resourceName" : "消息查看",
                          "resourceType" : "menu",
                          "subResource" : [],
                          "type" : "role"
                       }
                    ],
                    "type" : "role"
                 },
                 {
                    "auth" : "yes",
                    "resourceCode" : "BkgLineManage",
                    "resourceName" : "航线管理",
                    "resourceType" : "menu",
                    "subResource" : [],
                    "type" : "role"
                 }
              ],
              "type" : "role"
           },
           {
              "auth" : "yes",
              "resourceCode" : "Plan",
              "resourceName" : "计划单",
              "resourceType" : "menu",
              "subResource" : [
                 {
                    "auth" : "yes",
                    "resourceCode" : "PlanOrderList",
                    "resourceName" : "计划单",
                    "resourceType" : "menu",
                    "subResource" : [],
                    "type" : "role"
                 }
              ],
              "type" : "role"
           },
           {
              "auth" : "yes",
              "resourceCode" : "Notice",
              "resourceName" : "消息管理",
              "resourceType" : "menu",
              "subResource" : [
                 {
                    "auth" : "yes",
                    "resourceCode" : "NoticeParams",
                    "resourceName" : "参数列表",
                    "resourceType" : "menu",
                    "subResource" : [],
                    "type" : "role"
                 },
                 {
                    "auth" : "yes",
                    "resourceCode" : "NoticeTemplate",
                    "resourceName" : "消息模板",
                    "resourceType" : "menu",
                    "subResource" : [],
                    "type" : "role"
                 },
                 {
                    "auth" : "yes",
                    "resourceCode" : "NoticeEvents",
                    "resourceName" : "事件配置",
                    "resourceType" : "menu",
                    "subResource" : [],
                    "type" : "role"
                 },
                 {
                    "auth" : "yes",
                    "resourceCode" : "NoticeTrigger",
                    "resourceName" : "事件触发",
                    "resourceType" : "menu",
                    "subResource" : [],
                    "type" : "role"
                 },
                 {
                    "auth" : "yes",
                    "resourceCode" : "NoticeDelay",
                    "resourceName" : "定时触发",
                    "resourceType" : "menu",
                    "subResource" : [],
                    "type" : "role"
                 },
                 {
                    "auth" : "yes",
                    "resourceCode" : "NoticeSend",
                    "resourceName" : "发送消息",
                    "resourceType" : "menu",
                    "subResource" : [],
                    "type" : "role"
                 }
              ],
              "type" : "role"
           }
        ],
        "msg" : "success"
     }
};