
module.exports = (prams) => {
  return {
    "code":0,
    "msg":"success",
    "data":{
      "amt": 10.00,
      "bds": [
        {
          "bdEmployeeId": 20,
          "bdEmployeeName": "op",
          "createdBy": 0,
          "createdName": "",
          "createdTime": null,
          "expressBdId": 1,
          "expressId": 3,
          "expressNo": "xx",
          "revision": 2,
          "state": "valid",
          "updatedBy": 20,
          "updatedName": "操作【勿动】",
          "updatedTime": "2021-01-12 14:14:52"
        }
      ],
      "businessType": "ship_export_fcl",
      "createdBy": 20,
      "createdName": "操作【勿动】",
      "createdTime": "2020-11-05 11:13:50",
      "currency": "CNY",
      "expressId": 3,
      "expressNo": "222",
      "expressOrgid": 0,
      "expressSupplierId": 1,
      "expressSupplierName": "",
      "expressType": "domestic",
      "orders": {
        "hello_003": {
          "blList": [
            {
              "blNo": "M001",
              "blType": "mbl",
              "oid": 2,
              "orderNo": "hello_003",
              "postId": 2,
              "selectedStatus": 1
            },
            {
              "blNo": "H001",
              "blType": "hbl",
              "oid": 3,
              "orderNo": "hello_003",
              "postId": 0,
              "selectedStatus": 2
            }
          ],
          "guaranteeDocumentList": [
            {
              "docName": "产地证",
              "docNo": "doc123",
              "docType": "trade",
              "oid": 0,
              "orderNo": "hello_003",
              "postId": 2,
              "selectedStatus": 1
            }
          ],
          "tradeDocumentList": [
            {
              "docName": "产地证1",
              "docNo": "doc123",
              "docType": 'trade',
              "oid": 2,
              "orderNo": "hello_003",
              "postId": 2,
              "selectedStatus": 1
            },
            {
              "docName": "产地证2",
              "docNo": "doc1234",
              "docType": 'trade',
              "oid": 3,
              "orderNo": "hello_003",
              "postId": 0,
              "selectedStatus": 2
            }
          ]
        },
        "hello_004": {
          "blList": [
            {
              "blNo": "M002",
              "blType": "MBL",
              "oid": 2,
              "orderNo": "hello_004",
              "postId": 2,
              "selectedStatus": 1
            },
            {
              "blNo": "H002",
              "blType": "HBL",
              "oid": 3,
              "orderNo": "hello_004",
              "postId": 0,
              "selectedStatus": 0
            }
          ],
          "guaranteeDocumentList": [
            {
              "docName": "SWB",
              "docNo": "doc1241",
              "docType": "guarantee",
              "oid": 0,
              "orderNo": "hello_004",
              "postId": 2,
              "selectedStatus": 1
            },
            {
              "docName": "倒签预借顺签保函",
              "docNo": "doc1242",
              "docType": "guarantee",
              "oid": 0,
              "orderNo": "hello_004",
              "postId": 2,
              "selectedStatus": 1
            },
            {
              "docName": "改单保函",
              "docNo": "doc1243",
              "docType": "guarantee",
              "oid": 0,
              "orderNo": "hello_004",
              "postId": 2,
              "selectedStatus": 1
            },
            {
              "docName": "账单",
              "docNo": "doc1244",
              "docType": "guarantee",
              "oid": 0,
              "orderNo": "hello_004",
              "postId": 2,
              "selectedStatus": 1
            },
            {
              "docName": "HBL",
              "docNo": "doc1245",
              "docType": "guarantee",
              "oid": 0,
              "orderNo": "hello_004",
              "postId": 2,
              "selectedStatus": 1
            },
            {
              "docName": "MBL",
              "docNo": "doc1246",
              "docType": "guarantee",
              "oid": 0,
              "orderNo": "hello_004",
              "postId": 2,
              "selectedStatus": 1
            }
          ],
          "tradeDocumentList": [
            {
              "docName": "HBL船贸",
              "docNo": "doc1231",
              "docType": 'trade',
              "oid": 2,
              "orderNo": "hello_004",
              "postId": 2,
              "selectedStatus": 1
            },
            {
              "docName": "HBL船证",
              "docNo": "doc1232",
              "docType": 'trade',
              "oid": 3,
              "orderNo": "hello_004",
              "postId": 0,
              "selectedStatus": 0
            },
            {
              "docName": "保单",
              "docNo": "doc12333",
              "docType": 'trade',
              "oid": 2,
              "orderNo": "hello_004",
              "postId": 2,
              "selectedStatus": 1
            },
            {
              "docName": "货运险业务倒签保函",
              "docNo": "doc12334",
              "docType": 'trade',
              "oid": 2,
              "orderNo": "hello_004",
              "postId": 2,
              "selectedStatus": 1
            },
            {
              "docName": "产地证FROM",
              "docNo": "doc12335",
              "docType": 'trade',
              "oid": 3,
              "orderNo": "hello_004",
              "postId": 0,
              "selectedStatus": 0
            }
          ]
        }
      },
      "payType": "prepaid",
      "postTime": "2020-11-06 00:00:00",
      "postType": "mail",
      "postUser": "长帆国际物流",
      "receisendType": "send",
      "receiveAddress": "112",
      "receiveCompany": "测试公司1",
      "receiveCompanyId": 1,
      "recipient": "联系方式",
      "recipientPhone": "18888888888",
      "sendAddress": "1",
      "sendCompany": "测试公司2",
      "sendCompanyId": 2,
      "sender": "2",
      "senderPhone": "13480691609",
      "signTime": "2020-11-11 00:00:00",
      "signUser": "111",
      "status": "to_send",
      "updatedBy": 20,
      "updatedName": "操作【勿动】",
      "updatedTime": "2021-01-12 15:08:50",
      "expressCode":"xx",
      "payer":"owner"
    }
  }
};
